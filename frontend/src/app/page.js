import Image from "next/image";
import styles from "./page.module.css"; // Access specific styles from the module using styles.ClassName (locally scoped)

export default async function Home() {
  var response = await fetch('http://backend:3001/')
  var data = await response.json()
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <p>Data from db: {JSON.stringify(data)}</p>
      </main>
    </div>
  );
}
