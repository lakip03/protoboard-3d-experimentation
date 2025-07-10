import ProtoboardScene from "@/components/ProtoboardScene";
import SideMenu from "@/components/SideMenu";
import { ComponentProvider } from "@/contexts/ComponentContext";

export default function Home() {
  return (
    <ComponentProvider>
      <div className="w-full h-screen relative">
        <SideMenu />
        <ProtoboardScene />
      </div>
    </ComponentProvider>
  );
}
