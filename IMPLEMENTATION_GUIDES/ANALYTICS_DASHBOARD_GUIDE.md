# 📊 Real-time Analytics Dashboard Implementation Guide

## Overview

Build a sophisticated real-time analytics dashboard that processes meeting data in real-time and provides actionable insights. This demonstrates data engineering skills, real-time processing, and business intelligence - all highly valued by FAANG companies.

## Tech Stack

- **Streaming**: Apache Kafka + Kafka Streams
- **Storage**: ClickHouse (time-series) + Redis (real-time cache)
- **Processing**: Node.js streams + Apache Spark (optional)
- **Frontend**: React + D3.js + Chart.js
- **Real-time**: WebSocket + Server-Sent Events

## Architecture Overview

```
Meeting Events → Kafka → Stream Processing → ClickHouse → Analytics API → Dashboard
                  ↓
              Redis Cache ← WebSocket → Real-time UI Updates
```

## Implementation Steps

### Phase 1: Event Streaming Setup (Week 1)

#### 1. Kafka Configuration

```yaml
# docker-compose.analytics.yml
version: "3.8"
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:latest
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000

  kafka:
    image: confluentinc/cp-kafka:latest
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1

  clickhouse:
    image: clickhouse/clickhouse-server:latest
    ports:
      - "8123:8123"
      - "9000:9000"
    volumes:
      - clickhouse_data:/var/lib/clickhouse
    environment:
      CLICKHOUSE_DB: analytics
      CLICKHOUSE_USER: admin
      CLICKHOUSE_PASSWORD: password

volumes:
  clickhouse_data:
```

#### 2. Event Producer (Meeting Service Integration)

```javascript
// services/meeting-service/src/eventProducer.js
import { Kafka } from "kafkajs";

class MeetingEventProducer {
  constructor() {
    this.kafka = Kafka({
      clientId: "meeting-service",
      brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
    });
    this.producer = this.kafka.producer();
  }

  async connect() {
    await this.producer.connect();
    console.log("✅ Kafka producer connected");
  }

  async publishMeetingEvent(eventType, data) {
    const event = {
      eventType,
      timestamp: Date.now(),
      meetingId: data.meetingId,
      userId: data.userId,
      data,
    };

    await this.producer.send({
      topic: "meeting-events",
      messages: [
        {
          key: data.meetingId,
          value: JSON.stringify(event),
          timestamp: event.timestamp.toString(),
        },
      ],
    });

    console.log(`📊 Published event: ${eventType}`);
  }

  // Meeting lifecycle events
  async meetingStarted(meetingData) {
    await this.publishMeetingEvent("MEETING_STARTED", {
      meetingId: meetingData.id,
      hostId: meetingData.hostId,
      participants: meetingData.participants,
      meetingType: meetingData.type,
      duration: 0,
    });
  }

  async participantJoined(meetingId, participant) {
    await this.publishMeetingEvent("PARTICIPANT_JOINED", {
      meetingId,
      userId: participant.id,
      userName: participant.name,
      joinTime: Date.now(),
      deviceInfo: participant.deviceInfo,
    });
  }

  async participantLeft(meetingId, participant, duration) {
    await this.publishMeetingEvent("PARTICIPANT_LEFT", {
      meetingId,
      userId: participant.id,
      duration: duration, // in seconds
      leaveReason: participant.leaveReason || "USER_LEFT",
    });
  }

  async meetingEnded(meetingData) {
    await this.publishMeetingEvent("MEETING_ENDED", {
      meetingId: meetingData.id,
      duration: meetingData.duration,
      totalParticipants: meetingData.participants.length,
      maxConcurrentUsers: meetingData.maxConcurrentUsers,
      audioMinutes: meetingData.audioMinutes,
      videoMinutes: meetingData.videoMinutes,
    });
  }

  // Quality metrics
  async qualityMetrics(meetingId, userId, metrics) {
    await this.publishMeetingEvent("QUALITY_METRICS", {
      meetingId,
      userId,
      metrics: {
        audioQuality: metrics.audioQuality, // 1-5
        videoQuality: metrics.videoQuality, // 1-5
        networkLatency: metrics.networkLatency, // ms
        packetLoss: metrics.packetLoss, // percentage
        bandwidth: metrics.bandwidth, // kbps
        cpu: metrics.cpu, // percentage
        memory: metrics.memory, // percentage
      },
    });
  }
}

export default new MeetingEventProducer();
```

### Phase 2: Stream Processing (Week 2)

#### 1. Kafka Streams Processor

```javascript
// services/analytics-service/src/streamProcessor.js
import { Kafka } from "kafkajs";
import { ClickHouse } from "clickhouse";

class AnalyticsStreamProcessor {
  constructor() {
    this.kafka = Kafka({
      clientId: "analytics-processor",
      brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
    });

    this.clickhouse = new ClickHouse({
      url: process.env.CLICKHOUSE_URL || "http://localhost:8123",
      database: "analytics",
      username: "admin",
      password: "password",
    });

    this.consumer = this.kafka.consumer({ groupId: "analytics-group" });
    this.realTimeMetrics = new Map(); // In-memory for real-time dashboard
  }

  async initialize() {
    // Create ClickHouse tables
    await this.createTables();

    // Connect Kafka consumer
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: "meeting-events" });

    console.log("✅ Analytics stream processor initialized");
  }

  async createTables() {
    // Meeting events table
    await this.clickhouse.query(`
      CREATE TABLE IF NOT EXISTS meeting_events (
        event_id String,
        event_type String,
        timestamp DateTime64(3),
        meeting_id String,
        user_id String,
        data String
      ) ENGINE = MergeTree()
      ORDER BY (timestamp, meeting_id)
      TTL timestamp + INTERVAL 1 YEAR
    `);

    // Aggregated metrics table
    await this.clickhouse.query(`
      CREATE TABLE IF NOT EXISTS meeting_metrics_hourly (
        hour DateTime,
        total_meetings UInt32,
        total_participants UInt32,
        avg_duration Float32,
        avg_quality_score Float32,
        total_minutes UInt64
      ) ENGINE = SummingMergeTree()
      ORDER BY hour
    `);

    // Real-time quality metrics
    await this.clickhouse.query(`
      CREATE TABLE IF NOT EXISTS quality_metrics (
        timestamp DateTime64(3),
        meeting_id String,
        user_id String,
        audio_quality UInt8,
        video_quality UInt8,
        network_latency UInt32,
        packet_loss Float32,
        bandwidth UInt32,
        cpu Float32,
        memory Float32
      ) ENGINE = MergeTree()
      ORDER BY (timestamp, meeting_id, user_id)
      TTL timestamp + INTERVAL 30 DAY
    `);
  }

  async startProcessing() {
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const event = JSON.parse(message.value.toString());

          // Store raw event
          await this.storeEvent(event);

          // Process based on event type
          await this.processEvent(event);

          // Update real-time metrics
          this.updateRealTimeMetrics(event);
        } catch (error) {
          console.error("Stream processing error:", error);
        }
      },
    });
  }

  async storeEvent(event) {
    await this.clickhouse.insert("meeting_events", [
      {
        event_id: `${event.meetingId}_${event.timestamp}`,
        event_type: event.eventType,
        timestamp: new Date(event.timestamp),
        meeting_id: event.meetingId,
        user_id: event.userId || "",
        data: JSON.stringify(event.data),
      },
    ]);
  }

  async processEvent(event) {
    switch (event.eventType) {
      case "MEETING_STARTED":
        await this.processMeetingStarted(event);
        break;
      case "PARTICIPANT_JOINED":
        await this.processParticipantJoined(event);
        break;
      case "PARTICIPANT_LEFT":
        await this.processParticipantLeft(event);
        break;
      case "MEETING_ENDED":
        await this.processMeetingEnded(event);
        break;
      case "QUALITY_METRICS":
        await this.processQualityMetrics(event);
        break;
    }
  }

  async processQualityMetrics(event) {
    const metrics = event.data.metrics;

    await this.clickhouse.insert("quality_metrics", [
      {
        timestamp: new Date(event.timestamp),
        meeting_id: event.data.meetingId,
        user_id: event.data.userId,
        audio_quality: metrics.audioQuality,
        video_quality: metrics.videoQuality,
        network_latency: metrics.networkLatency,
        packet_loss: metrics.packetLoss,
        bandwidth: metrics.bandwidth,
        cpu: metrics.cpu,
        memory: metrics.memory,
      },
    ]);
  }

  updateRealTimeMetrics(event) {
    const hour = new Date().toISOString().slice(0, 13) + ":00:00";

    if (!this.realTimeMetrics.has(hour)) {
      this.realTimeMetrics.set(hour, {
        meetings: new Set(),
        participants: new Set(),
        totalDuration: 0,
        qualityScores: [],
        events: 0,
      });
    }

    const metrics = this.realTimeMetrics.get(hour);
    metrics.events++;

    switch (event.eventType) {
      case "MEETING_STARTED":
        metrics.meetings.add(event.data.meetingId);
        break;
      case "PARTICIPANT_JOINED":
        metrics.participants.add(event.data.userId);
        break;
      case "MEETING_ENDED":
        metrics.totalDuration += event.data.duration;
        break;
    }
  }

  getRealTimeMetrics() {
    const current = Array.from(this.realTimeMetrics.entries()).map(
      ([hour, data]) => ({
        hour,
        totalMeetings: data.meetings.size,
        totalParticipants: data.participants.size,
        totalDuration: data.totalDuration,
        events: data.events,
      })
    );

    return current.slice(-24); // Last 24 hours
  }
}

export default new AnalyticsStreamProcessor();
```

### Phase 3: Analytics API (Week 3)

#### 1. Analytics Service API

```javascript
// services/analytics-service/src/analyticsController.js
import { ClickHouse } from "clickhouse";
import Redis from "redis";

class AnalyticsController {
  constructor() {
    this.clickhouse = new ClickHouse({
      url: process.env.CLICKHOUSE_URL,
      database: "analytics",
    });
    this.redis = Redis.createClient({ url: process.env.REDIS_URL });
  }

  // Dashboard overview metrics
  async getDashboardOverview(req, res) {
    try {
      const { timeRange = "24h" } = req.query;
      const cacheKey = `dashboard:overview:${timeRange}`;

      // Check cache first
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }

      const timeFilter = this.getTimeFilter(timeRange);

      // Parallel queries for performance
      const [
        totalMeetings,
        totalParticipants,
        avgDuration,
        qualityMetrics,
        hourlyTrends,
      ] = await Promise.all([
        this.getTotalMeetings(timeFilter),
        this.getTotalParticipants(timeFilter),
        this.getAverageDuration(timeFilter),
        this.getQualityMetrics(timeFilter),
        this.getHourlyTrends(timeFilter),
      ]);

      const overview = {
        totalMeetings: totalMeetings[0]?.count || 0,
        totalParticipants: totalParticipants[0]?.count || 0,
        avgDuration: Math.round(avgDuration[0]?.duration || 0),
        avgQualityScore: Math.round(
          (qualityMetrics[0]?.avg_audio + qualityMetrics[0]?.avg_video) / 2 || 0
        ),
        hourlyTrends,
        lastUpdated: new Date().toISOString(),
      };

      // Cache for 5 minutes
      await this.redis.setex(cacheKey, 300, JSON.stringify(overview));

      res.json(overview);
    } catch (error) {
      console.error("Dashboard overview error:", error);
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  }

  // Real-time meeting analytics
  async getRealTimeMetrics(req, res) {
    try {
      // Get active meetings
      const activeMeetings = await this.clickhouse.query(`
        SELECT 
          meeting_id,
          COUNT(DISTINCT user_id) as participants,
          AVG(audio_quality) as avg_audio,
          AVG(video_quality) as avg_video,
          AVG(network_latency) as avg_latency
        FROM quality_metrics 
        WHERE timestamp > NOW() - INTERVAL 5 MINUTE
        GROUP BY meeting_id
        ORDER BY participants DESC
      `);

      // System performance metrics
      const systemMetrics = await this.clickhouse.query(`
        SELECT 
          AVG(cpu) as avg_cpu,
          AVG(memory) as avg_memory,
          AVG(bandwidth) as avg_bandwidth,
          COUNT(*) as total_connections
        FROM quality_metrics 
        WHERE timestamp > NOW() - INTERVAL 1 MINUTE
      `);

      res.json({
        activeMeetings: activeMeetings.data,
        systemMetrics: systemMetrics.data[0] || {},
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Real-time metrics error:", error);
      res.status(500).json({ error: "Failed to fetch real-time metrics" });
    }
  }

  // User engagement analytics
  async getUserEngagement(req, res) {
    try {
      const { timeRange = "7d" } = req.query;
      const timeFilter = this.getTimeFilter(timeRange);

      const engagement = await this.clickhouse.query(`
        WITH user_stats AS (
          SELECT 
            user_id,
            COUNT(DISTINCT meeting_id) as meetings_attended,
            SUM(CASE WHEN event_type = 'PARTICIPANT_LEFT' THEN toFloat32(JSONExtractString(data, 'duration')) ELSE 0 END) as total_minutes,
            AVG(CASE WHEN event_type = 'QUALITY_METRICS' THEN toFloat32(JSONExtractString(data, 'metrics.audioQuality')) ELSE NULL END) as avg_audio_quality
          FROM meeting_events 
          WHERE ${timeFilter}
          GROUP BY user_id
        )
        SELECT 
          meetings_attended,
          COUNT(*) as user_count,
          AVG(total_minutes) as avg_minutes,
          AVG(avg_audio_quality) as avg_quality
        FROM user_stats
        GROUP BY meetings_attended
        ORDER BY meetings_attended
      `);

      res.json({
        engagementDistribution: engagement.data,
        timeRange,
      });
    } catch (error) {
      console.error("User engagement error:", error);
      res.status(500).json({ error: "Failed to fetch engagement data" });
    }
  }

  // Quality analytics with geographic data
  async getQualityAnalytics(req, res) {
    try {
      const qualityByRegion = await this.clickhouse.query(`
        SELECT 
          JSONExtractString(data, 'region') as region,
          AVG(toFloat32(JSONExtractString(data, 'metrics.audioQuality'))) as avg_audio,
          AVG(toFloat32(JSONExtractString(data, 'metrics.videoQuality'))) as avg_video,
          AVG(toFloat32(JSONExtractString(data, 'metrics.networkLatency'))) as avg_latency,
          COUNT(*) as sample_count
        FROM meeting_events 
        WHERE event_type = 'QUALITY_METRICS' 
        AND timestamp > NOW() - INTERVAL 24 HOUR
        GROUP BY region
        ORDER BY avg_audio DESC
      `);

      const qualityTrends = await this.clickhouse.query(`
        SELECT 
          toStartOfHour(timestamp) as hour,
          AVG(toFloat32(JSONExtractString(data, 'metrics.audioQuality'))) as audio_quality,
          AVG(toFloat32(JSONExtractString(data, 'metrics.videoQuality'))) as video_quality,
          AVG(toFloat32(JSONExtractString(data, 'metrics.networkLatency'))) as latency
        FROM meeting_events 
        WHERE event_type = 'QUALITY_METRICS' 
        AND timestamp > NOW() - INTERVAL 24 HOUR
        GROUP BY hour
        ORDER BY hour
      `);

      res.json({
        qualityByRegion: qualityByRegion.data,
        qualityTrends: qualityTrends.data,
      });
    } catch (error) {
      console.error("Quality analytics error:", error);
      res.status(500).json({ error: "Failed to fetch quality analytics" });
    }
  }

  getTimeFilter(timeRange) {
    const intervals = {
      "1h": "INTERVAL 1 HOUR",
      "24h": "INTERVAL 24 HOUR",
      "7d": "INTERVAL 7 DAY",
      "30d": "INTERVAL 30 DAY",
    };

    return `timestamp > NOW() - ${intervals[timeRange] || intervals["24h"]}`;
  }

  async getTotalMeetings(timeFilter) {
    const result = await this.clickhouse.query(`
      SELECT COUNT(DISTINCT meeting_id) as count 
      FROM meeting_events 
      WHERE event_type = 'MEETING_STARTED' AND ${timeFilter}
    `);
    return result.data;
  }

  async getTotalParticipants(timeFilter) {
    const result = await this.clickhouse.query(`
      SELECT COUNT(DISTINCT user_id) as count 
      FROM meeting_events 
      WHERE event_type = 'PARTICIPANT_JOINED' AND ${timeFilter}
    `);
    return result.data;
  }

  async getAverageDuration(timeFilter) {
    const result = await this.clickhouse.query(`
      SELECT AVG(toFloat32(JSONExtractString(data, 'duration'))) as duration 
      FROM meeting_events 
      WHERE event_type = 'MEETING_ENDED' AND ${timeFilter}
    `);
    return result.data;
  }

  async getQualityMetrics(timeFilter) {
    const result = await this.clickhouse.query(`
      SELECT 
        AVG(toFloat32(JSONExtractString(data, 'metrics.audioQuality'))) as avg_audio,
        AVG(toFloat32(JSONExtractString(data, 'metrics.videoQuality'))) as avg_video
      FROM meeting_events 
      WHERE event_type = 'QUALITY_METRICS' AND ${timeFilter}
    `);
    return result.data;
  }

  async getHourlyTrends(timeFilter) {
    const result = await this.clickhouse.query(`
      SELECT 
        toStartOfHour(timestamp) as hour,
        COUNT(DISTINCT CASE WHEN event_type = 'MEETING_STARTED' THEN meeting_id END) as meetings,
        COUNT(DISTINCT CASE WHEN event_type = 'PARTICIPANT_JOINED' THEN user_id END) as participants
      FROM meeting_events 
      WHERE ${timeFilter}
      GROUP BY hour
      ORDER BY hour
    `);
    return result.data;
  }
}

export default new AnalyticsController();
```

### Phase 4: Real-time Dashboard Frontend (Week 4)

#### 1. Analytics Dashboard Component

```jsx
// frontend/src/components/analytics/AnalyticsDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Tab,
  Tabs,
} from "@mui/material";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Groups,
  Schedule,
  NetworkCheck,
} from "@mui/icons-material";

const AnalyticsDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState(null);
  const [qualityAnalytics, setQualityAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState("24h");
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [overviewRes, qualityRes] = await Promise.all([
        fetch(`/api/v1/analytics/dashboard/overview?timeRange=${timeRange}`),
        fetch("/api/v1/analytics/quality"),
      ]);

      const overviewData = await overviewRes.json();
      const qualityData = await qualityRes.json();

      setOverview(overviewData);
      setQualityAnalytics(qualityData);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  // Real-time updates via WebSocket
  useEffect(() => {
    const ws = new WebSocket(
      process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8005"
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "REAL_TIME_METRICS") {
        setRealTimeMetrics(data.payload);
      }
    };

    // Fetch initial data
    fetchDashboardData();

    // Cleanup
    return () => ws.close();
  }, [fetchDashboardData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const MetricCard = ({ title, value, icon, trend, color = "primary" }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            {trend && (
              <Box display="flex" alignItems="center" mt={1}>
                <TrendingUp
                  color={trend > 0 ? "success" : "error"}
                  fontSize="small"
                />
                <Typography
                  variant="body2"
                  color={trend > 0 ? "success.main" : "error.main"}
                >
                  {trend > 0 ? "+" : ""}
                  {trend}%
                </Typography>
              </Box>
            )}
          </Box>
          <Box color={`${color}.main`}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  );

  const QualityChart = ({ data, title }) => (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" />
          <YAxis domain={[0, 5]} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="audio_quality"
            stroke="#2196f3"
            strokeWidth={2}
            name="Audio Quality"
          />
          <Line
            type="monotone"
            dataKey="video_quality"
            stroke="#4caf50"
            strokeWidth={2}
            name="Video Quality"
          />
          <Line
            type="monotone"
            dataKey="latency"
            stroke="#ff9800"
            strokeWidth={2}
            name="Latency (ms)"
            yAxisId="right"
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );

  if (loading) {
    return (
      <Box p={3}>
        <Typography variant="h4" gutterBottom>
          Analytics Dashboard
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Real-time Analytics Dashboard
      </Typography>

      {/* Time Range Selector */}
      <Box mb={3}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Overview" />
          <Tab label="Quality Metrics" />
          <Tab label="User Engagement" />
          <Tab label="System Performance" />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      {activeTab === 0 && overview && (
        <>
          {/* Key Metrics */}
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Total Meetings"
                value={overview.totalMeetings}
                icon={<Groups fontSize="large" />}
                trend={12}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Total Participants"
                value={overview.totalParticipants}
                icon={<Groups fontSize="large" />}
                trend={8}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Avg Duration"
                value={`${overview.avgDuration}m`}
                icon={<Schedule fontSize="large" />}
                trend={-3}
                color="warning"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Quality Score"
                value={`${overview.avgQualityScore}/5`}
                icon={<NetworkCheck fontSize="large" />}
                trend={5}
                color="info"
              />
            </Grid>
          </Grid>

          {/* Hourly Trends */}
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Meeting Trends
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={overview.hourlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="meetings"
                      stackId="1"
                      stroke="#2196f3"
                      fill="#2196f3"
                      fillOpacity={0.6}
                      name="Meetings"
                    />
                    <Area
                      type="monotone"
                      dataKey="participants"
                      stackId="2"
                      stroke="#4caf50"
                      fill="#4caf50"
                      fillOpacity={0.6}
                      name="Participants"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} lg={4}>
              {/* Real-time Status */}
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Live Status
                </Typography>
                {realTimeMetrics && (
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Active Meetings:{" "}
                      {realTimeMetrics.activeMeetings?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      System CPU:{" "}
                      {Math.round(realTimeMetrics.systemMetrics?.avg_cpu || 0)}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Avg Bandwidth:{" "}
                      {Math.round(
                        realTimeMetrics.systemMetrics?.avg_bandwidth || 0
                      )}{" "}
                      kbps
                    </Typography>
                  </Box>
                )}
              </Paper>

              {/* Quality Distribution */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Quality Distribution
                </Typography>
                {/* Add pie chart for quality distribution */}
              </Paper>
            </Grid>
          </Grid>
        </>
      )}

      {/* Quality Metrics Tab */}
      {activeTab === 1 && qualityAnalytics && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <QualityChart
              data={qualityAnalytics.qualityTrends}
              title="Quality Trends (24h)"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Quality by Region
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={qualityAnalytics.qualityByRegion}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="avg_audio"
                    fill="#2196f3"
                    name="Audio Quality"
                  />
                  <Bar
                    dataKey="avg_video"
                    fill="#4caf50"
                    name="Video Quality"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AnalyticsDashboard;
```

## Why This Impresses FAANG

1. **Big Data Processing**: Kafka + ClickHouse shows you can handle scale
2. **Real-time Systems**: WebSocket + streaming demonstrates real-time expertise
3. **Data Engineering**: ETL pipelines, data modeling, aggregations
4. **Performance**: Caching strategies, query optimization
5. **Visualization**: Advanced charts show frontend data skills
6. **System Design**: Event-driven architecture, microservices integration

This analytics system demonstrates enterprise-level data engineering skills that are highly valued at FAANG companies!
