import { NextPage } from "next";
import React from "react";
import { Students } from "../../components/Students/Students";

const Index: NextPage = () => {
    return <Students alwaysLimited={false} />;
};

export default Index;
