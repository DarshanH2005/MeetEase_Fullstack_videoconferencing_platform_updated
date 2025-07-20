// pages/[url].js
import { useRouter } from 'next/router';
import ProtectedMeetingRoom from "../components/meeting/ProtectedMeetingRoom";

const Joins = () => {
  const router = useRouter();
  const { url } = router.query; // The dynamic segment from the URL

  return (
    <ProtectedMeetingRoom />
  );
};

export default Joins;
