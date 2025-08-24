# 🏗️ Microservices Architecture Implementation Guide

## Overview

Transform your monolithic MeetEase app into a microservices architecture - this demonstrates system design skills, scalability knowledge, and DevOps expertise that FAANG companies highly value.

## Current vs Target Architecture

### Current (Monolith)

```
Frontend (Next.js) → Backend (Express.js) → MongoDB
```

### Target (Microservices)

```
Frontend → API Gateway → [Auth Service | Meeting Service | User Service | Notification Service]
                      ↓
              [Message Queue | Service Mesh | Database per Service]
```

## Microservices Breakdown

### 1. **Authentication Service**

- **Responsibility**: User auth, OAuth, JWT management
- **Database**: PostgreSQL (user credentials)
- **Port**: 8001

### 2. **User Service**

- **Responsibility**: User profiles, preferences, avatars
- **Database**: MongoDB (user documents)
- **Port**: 8002

### 3. **Meeting Service**

- **Responsibility**: Meeting creation, WebRTC signaling
- **Database**: Redis (active meetings) + MongoDB (meeting history)
- **Port**: 8003

### 4. **Notification Service**

- **Responsibility**: Email, push notifications, real-time alerts
- **Database**: Redis (temporary notifications)
- **Port**: 8004

### 5. **Analytics Service**

- **Responsibility**: Meeting metrics, user analytics
- **Database**: ClickHouse (time-series data)
- **Port**: 8005

## Implementation Steps

### Phase 1: Infrastructure Setup (Week 1)

#### 1. Docker Setup

```dockerfile
# docker/auth-service/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8001
CMD ["npm", "start"]
```

#### 2. Docker Compose for Development

```yaml
# docker-compose.yml
version: "3.8"

services:
  # API Gateway
  api-gateway:
    build: ./services/api-gateway
    ports:
      - "8000:8000"
    environment:
      - AUTH_SERVICE_URL=http://auth-service:8001
      - USER_SERVICE_URL=http://user-service:8002
      - MEETING_SERVICE_URL=http://meeting-service:8003
    depends_on:
      - auth-service
      - user-service
      - meeting-service

  # Authentication Service
  auth-service:
    build: ./services/auth-service
    ports:
      - "8001:8001"
    environment:
      - DATABASE_URL=postgresql://user:pass@auth-db:5432/auth
      - JWT_SECRET=${JWT_SECRET}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
    depends_on:
      - auth-db

  # User Service
  user-service:
    build: ./services/user-service
    ports:
      - "8002:8002"
    environment:
      - MONGODB_URI=mongodb://user-mongo:27017/users
    depends_on:
      - user-mongo

  # Meeting Service
  meeting-service:
    build: ./services/meeting-service
    ports:
      - "8003:8003"
    environment:
      - MONGODB_URI=mongodb://meeting-mongo:27017/meetings
      - REDIS_URL=redis://redis:6379
    depends_on:
      - meeting-mongo
      - redis

  # Databases
  auth-db:
    image: postgres:15
    environment:
      POSTGRES_DB: auth
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - auth_data:/var/lib/postgresql/data

  user-mongo:
    image: mongo:6
    volumes:
      - user_data:/data/db

  meeting-mongo:
    image: mongo:6
    volumes:
      - meeting_data:/data/db

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  # Message Queue
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: password

volumes:
  auth_data:
  user_data:
  meeting_data:
  redis_data:
```

### Phase 2: API Gateway Implementation (Week 2)

#### 1. Express Gateway with Rate Limiting

```javascript
// services/api-gateway/src/app.js
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import Redis from "redis";

const app = express();
const redis = Redis.createClient({ url: process.env.REDIS_URL });

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP",
});

app.use(limiter);
app.use(express.json());

// Auth middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    // Check if token is blacklisted
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ error: "Token invalidated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
  }
};

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "API Gateway healthy",
    timestamp: new Date().toISOString(),
  });
});

// Service routing
app.use(
  "/api/v1/auth",
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/api/v1/auth": "" },
  })
);

app.use(
  "/api/v1/users",
  authenticateToken,
  createProxyMiddleware({
    target: process.env.USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/api/v1/users": "" },
    onProxyReq: (proxyReq, req) => {
      // Forward user info to downstream services
      proxyReq.setHeader("X-User-Id", req.user.id);
      proxyReq.setHeader("X-User-Email", req.user.email);
    },
  })
);

app.use(
  "/api/v1/meetings",
  authenticateToken,
  createProxyMiddleware({
    target: process.env.MEETING_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/api/v1/meetings": "" },
    onProxyReq: (proxyReq, req) => {
      proxyReq.setHeader("X-User-Id", req.user.id);
    },
  })
);

// Circuit breaker for service health
const serviceHealthCheck = async () => {
  const services = [
    { name: "auth", url: process.env.AUTH_SERVICE_URL },
    { name: "user", url: process.env.USER_SERVICE_URL },
    { name: "meeting", url: process.env.MEETING_SERVICE_URL },
  ];

  for (const service of services) {
    try {
      const response = await fetch(`${service.url}/health`);
      if (!response.ok) {
        console.error(`❌ ${service.name} service unhealthy`);
      }
    } catch (error) {
      console.error(`❌ ${service.name} service unreachable:`, error.message);
    }
  }
};

// Health check every 30 seconds
setInterval(serviceHealthCheck, 30000);

app.listen(8000, () => {
  console.log("🚀 API Gateway running on port 8000");
});
```

### Phase 3: Service Implementation (Week 3)

#### 1. Authentication Service

```javascript
// services/auth-service/src/app.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Pool } from "pg";

const app = express();
const db = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(express.json());

// Initialize database
const initDB = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMP
    )
  `);
};

// Register endpoint
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Check if user exists
    const existing = await db.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await db.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at",
      [email, passwordHash]
    );

    // Generate JWT
    const token = jwt.sign(
      { id: result.rows[0].id, email: result.rows[0].email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        createdAt: result.rows[0].created_at,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login endpoint
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Update last login
    await db.query(
      "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1",
      [user.id]
    );

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        lastLogin: new Date(),
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "Auth service healthy" });
});

initDB().then(() => {
  app.listen(8001, () => {
    console.log("🔐 Auth service running on port 8001");
  });
});
```

### Phase 4: Service Communication (Week 4)

#### 1. Message Queue Integration

```javascript
// shared/eventBus.js
import amqp from "amqplib";

class EventBus {
  constructor() {
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    this.connection = await amqp.connect(process.env.RABBITMQ_URL);
    this.channel = await this.connection.createChannel();

    // Declare exchanges
    await this.channel.assertExchange("user.events", "topic", {
      durable: true,
    });
    await this.channel.assertExchange("meeting.events", "topic", {
      durable: true,
    });
  }

  async publishEvent(exchange, routingKey, data) {
    const message = Buffer.from(
      JSON.stringify({
        ...data,
        timestamp: new Date().toISOString(),
        eventId: Date.now().toString(),
      })
    );

    return this.channel.publish(exchange, routingKey, message, {
      persistent: true,
      messageId: Date.now().toString(),
    });
  }

  async subscribeToEvents(exchange, routingKey, handler) {
    const queue = await this.channel.assertQueue("", { exclusive: true });
    await this.channel.bindQueue(queue.queue, exchange, routingKey);

    this.channel.consume(queue.queue, async (msg) => {
      if (msg) {
        try {
          const data = JSON.parse(msg.content.toString());
          await handler(data);
          this.channel.ack(msg);
        } catch (error) {
          console.error("Event handling error:", error);
          this.channel.nack(msg, false, false); // Dead letter queue
        }
      }
    });
  }
}

export default new EventBus();
```

#### 2. Service Discovery with Consul

```javascript
// shared/serviceDiscovery.js
import consul from "consul";

class ServiceDiscovery {
  constructor() {
    this.consul = consul();
  }

  async registerService(name, port, health_check_url) {
    return this.consul.agent.service.register({
      id: `${name}-${process.env.HOSTNAME || "localhost"}`,
      name,
      port,
      check: {
        http: health_check_url,
        interval: "10s",
      },
    });
  }

  async discoverService(serviceName) {
    const services = await this.consul.health.service({
      service: serviceName,
      passing: true,
    });

    if (services.length === 0) {
      throw new Error(`No healthy instances of ${serviceName} found`);
    }

    // Simple round-robin
    const service = services[Math.floor(Math.random() * services.length)];
    return `http://${service.Service.Address}:${service.Service.Port}`;
  }
}

export default new ServiceDiscovery();
```

## Why This Impresses FAANG

1. **System Design**: Shows you understand distributed systems
2. **Scalability**: Demonstrates horizontal scaling knowledge
3. **DevOps**: Docker, container orchestration, service mesh
4. **Reliability**: Circuit breakers, health checks, retries
5. **Performance**: Load balancing, caching, async communication
6. **Security**: Service-to-service auth, API gateway patterns

## Kubernetes Deployment (Bonus)

```yaml
# k8s/auth-service-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
    spec:
      containers:
        - name: auth-service
          image: meetease/auth-service:latest
          ports:
            - containerPort: 8001
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: auth-secrets
                  key: database-url
          livenessProbe:
            httpGet:
              path: /health
              port: 8001
            initialDelaySeconds: 30
            periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: auth-service
spec:
  selector:
    app: auth-service
  ports:
    - port: 8001
      targetPort: 8001
  type: ClusterIP
```

This architecture transformation demonstrates enterprise-level engineering skills and will definitely impress FAANG interviewers!
