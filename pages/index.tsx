import { NextPage } from "next";
import { Chat } from "@/components/chat";
import { cn } from "@/utils/tailwind";

const Home: NextPage = () => {
  return (
    <div
      className={cn(
        "flex h-[100%] w-screen items-center justify-center align-middle",
      )}
    >
      <Chat />
    </div>
  );
};

export default Home;
