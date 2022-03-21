import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import axios from "../../../lib/axios";
import { getBrowserId } from "../../../lib/util";

// URL: https://code-playground.com/playgrounds/from-template/{templateId}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { templateId } = ctx.query;

  return {
    props: { templateId },
  };
};

const FromTemplate = ({ templateId }: { templateId: string }) => {
  const router = useRouter();
  const [err, setErr] = useState("");

  const createPlayground = async () => {
    try {
      const { data: pid } = await axios.get("/create-playground", {
        params: {
          templateId,
          browserId: getBrowserId(),
        },
      });

      return router.replace(`/playgrounds/${pid}`);
    } catch (e: any) {
      console.error(e);
      setErr(e.message);
    }
  };

  useEffect(() => {
    createPlayground();
  }, []);

  return (
    <div
      style={{
        color: "white",
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Head>
        <title>Your Playground is being created</title>
      </Head>
      {err && (
        <>
          <h2>Something Went Wrong: {err}</h2>
          <Link href="/">Go Back</Link>
        </>
      )}

      {!err && <h2>Your playground ie being created...</h2>}
    </div>
  );
};

export default FromTemplate;
