import { API_URL } from "/constants.js";

export default async function Home() {
  //var response = await fetch(API_URL)
  //var response = await fetch("http://host.docker.internal:3001/");
  //var data = await response.json()
  return (
    <div>
      <main>
        <div>MAIN PAGE</div>
        {/* <p>Data from db: {JSON.stringify(data)}</p> */}
      </main>
    </div>
  );
}
