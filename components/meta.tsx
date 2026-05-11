import Head from "next/head";
import { FC } from "react";

const Meta: FC<{ title: string }> = ({ title }) => (
  <Head>
    <title>{title}</title>
  </Head>
);

export default Meta;
