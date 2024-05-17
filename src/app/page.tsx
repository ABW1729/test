"use client"
import Login from '../app/sign-in/SignIn'
import image from '../../public/stock.webp'
import Head from 'next/head';


export default function Home() {
  return (
    <>
    <Head>
        <link rel="stylesheet" href="./global1.css" />
      </Head>
     <Login></Login>
    </>
  );
}
