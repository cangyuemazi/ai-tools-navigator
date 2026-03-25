import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc]">
      <div className="w-full max-w-md mx-4 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-red-400" />
          </div>
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-lg font-medium text-gray-600 mb-2">页面未找到</h2>
        <p className="text-sm text-gray-400 mb-8">
          抱歉，您访问的页面不存在或已被移除。
        </p>
        <Button
          onClick={() => setLocation("/")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl"
        >
          <Home className="w-4 h-4 mr-2" />
          返回首页
        </Button>
      </div>
    </div>
  );
}
