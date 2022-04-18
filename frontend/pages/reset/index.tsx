import { NextPage } from "next";

/**
 * You are redirected here when your resetID to reset the password is not valid
 * @constructor
 */
const Reset: NextPage = () => {
  return (
    <h2 style={{ textAlign: "center" }}>
      The provided code to reset the password was not valid.
    </h2>
  );
};

export default Reset;
