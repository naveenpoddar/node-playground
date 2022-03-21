import React from "react";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

const playgrounds = [
  {
    id: "nodejs-simple-express-app",
    image:
      "https://www.brainvire.com/wp/wp-content/uploads/2016/05/express-js-an-ideal-node-js-framework-to-develop-enterprise-web-applications.jpg",
    title: "NodeJS Simple Express App",
    description: "A simple and scalable Express API.",
  },
  {
    id: "html-css-js-simple-app",
    image:
      "https://phantomlandscapes.files.wordpress.com/2021/04/html-css-javascript.jpg",
    title: "HTML, CSS, JS Simple App",
    description: "A simple and vanilla HTML, CSS, JS app.",
  },
];

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Welcome to Node Playground</title>
        <meta
          name="description"
          content="Node Playground is a web based IDE which is easy simple and quick to start with"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <section className="home">
        <h1 className="title">Welcome to Node Playgrounds</h1>
        <p className="about">
          This is a simple playground for building and coding amazing apps on
          your browser especially with Node.js. It is a work in progress.
        </p>

        <div className="selection">
          <h3 className="subtitle">Choose from any playground templates</h3>
          <p className="hint">
            You can choose from any of the templates below to get started.
          </p>

          <ul className="templates">
            {playgrounds.map((playground) => (
              <Link
                href={`/playgrounds/from-template/${playground.id}`}
                key={playground.id}
              >
                <li className="template">
                  <img src={playground.image} alt={playground.title} />
                  <div className="info">
                    <h4 className="name">{playground.title}</h4>
                    <p className="description">{playground.description}</p>
                  </div>
                </li>
              </Link>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
};

export default Home;
