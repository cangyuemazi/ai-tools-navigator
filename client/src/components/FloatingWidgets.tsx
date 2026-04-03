import { useState, useEffect } from 'react';
import { ArrowUp, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchSiteSettings, readCachedSiteSettings } from '@/lib/site-settings';

export default function FloatingWidgets() {
  const cachedSiteSettings = readCachedSiteSettings();
  const [showTop, setShowTop] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrError, setQrError] = useState(false);
  const [customerServiceQrCode, setCustomerServiceQrCode] = useState(cachedSiteSettings.customerServiceQrCode);

  useEffect(() => {
    // 监听我们给主滚动区域加的 id
    const container = document.getElementById('main-scroll-container');
    if (!container) return;
    const handleScroll = () => setShowTop(container.scrollTop > 300);
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchSiteSettings()
      .then((data) => {
        setCustomerServiceQrCode(data.customerServiceQrCode || '');
        setQrError(false);
      })
      .catch(() => {
        if (!cachedSiteSettings.customerServiceQrCode) {
          setCustomerServiceQrCode('');
          setQrError(true);
        }
      });
  }, []);

  const scrollToTop = () => {
    const container = document.getElementById('main-scroll-container');
    if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const qrCodeSrc = customerServiceQrCode || '/qrcode.png';

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4">
      {/* 微信客服按钮 */}
      <div 
        className="relative flex items-center justify-center"
        onMouseEnter={() => setShowQR(true)}
        onMouseLeave={() => setShowQR(false)}
      >
        <AnimatePresence>
          {showQR && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-full mb-4 right-0 bg-white/95 backdrop-blur-xl p-3 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 origin-bottom-right"
            >
              <div className="text-center text-sm text-gray-700 font-medium mb-2 whitespace-nowrap">
                扫码添加客服微信
              </div>
              <div className="w-32 h-32 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center">
                {qrError ? (
                  <span className="text-xs text-gray-400 text-center">
                    请先在后台上传<br />客服二维码
                  </span>
                ) : (
                  <img 
                    src={qrCodeSrc} 
                    alt="客服微信" 
                    className="w-full h-full object-cover" 
                    onError={() => setQrError(true)}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button className="w-12 h-12 bg-white/70 hover:bg-white/95 backdrop-blur-md text-gray-500 hover:text-green-500 rounded-full shadow-lg border border-gray-200/50 flex items-center justify-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
          <MessageCircle className="w-[22px] h-[22px]" />
        </button>
      </div>

      {/* 回到顶部按钮 */}
      <AnimatePresence>
        {showTop && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
            <button
              onClick={scrollToTop}
              className="w-12 h-12 bg-white/70 hover:bg-white/95 backdrop-blur-md text-gray-500 hover:text-blue-500 rounded-full shadow-lg border border-gray-200/50 flex items-center justify-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            >
              <ArrowUp className="w-[22px] h-[22px]" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}