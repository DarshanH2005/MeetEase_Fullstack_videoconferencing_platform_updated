import Image from 'next/image';
import logo from './logo.png';
import Link from 'next/link';

export default function SitemarkIcon() {
  return (
    <Link href="/">
      
        <Image 
          src={logo} 
          alt="logo" 
          width={100} 
          height={100} 
          style={{ cursor: 'pointer' }} 
        />
      
    </Link>
  );
}
