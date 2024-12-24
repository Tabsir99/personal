"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { secretAction } from "@/actions/authActions";
const SecretCode = () => {
  const [secret, setSecret] = useState("");
  const router = useRouter();

  const handleSecretSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const response = await secretAction(secret);

    if (response.status !== "success") {
      router.push("/");
      return;
    }

    return router.push("/dashboard");
  };

  return (
    <form onSubmit={handleSecretSubmit} className="space-y-4 flex flex-col">
      <div>
        <label htmlFor="secret" className="block text-gray-300 mb-2">
          Secret Code:
        </label>
        <input
          type="text"
          id="secret"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          className="w-full px-4 py-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          name="secret"
        />
      </div>

      <button
        type="submit"
        className="w-fit active:scale-90 bg-blue-500 text-white py-2 px-8 mx-auto duration-300 transition rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Submit
      </button>
    </form>
  );
};

export default SecretCode;
