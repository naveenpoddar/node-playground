import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import axios from "../../../lib/axios";

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
        },
      });

      return router.replace(`/playgrounds/${pid}`);
    } catch (e: any) {
      console.log(e);
      setErr(e.message);
    }
  };

  useEffect(() => {
    createPlayground();
  }, []);

  return <div style={{ color: "white" }}>Something Went Wrong: {err}</div>;
};

export default FromTemplate;
