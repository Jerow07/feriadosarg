import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

// Utility to convert Base64 vapid key to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  try {
    // Basic cleaning
    const cleanStr = base64String.trim().replace(/['"]/g, '');
    const padding = '='.repeat((4 - (cleanStr.length % 4)) % 4);
    const base64 = (cleanStr + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  } catch (e: any) {
    throw new Error(`Error decodificando VAPID (Len: ${base64String?.length}): ${e.message}`);
  }
}

export function PushSubscribe() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [supportPush, setSupportPush] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setSupportPush(true);
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) {
            setIsSubscribed(true);
          }
        });
      });
    }
  }, []);

  const subscribeUser = async () => {
    if (!('serviceWorker' in navigator)) return;
    setIsLoading(true);
    
    try {
      const reg = await navigator.serviceWorker.ready;
      
      const res = await Notification.requestPermission();
      if (res !== 'granted') {
          alert("Debes permitir las notificaciones en el navegador primero.");
          setIsLoading(false);
          return;
      }
      
      // 1. Force SW update
      await reg.update(); 
      
      // 2. Clear ANY existing subscription to avoid "pattern mismatch" conflicts
      const existingSub = await reg.pushManager.getSubscription();
      if (existingSub) {
        await existingSub.unsubscribe();
        console.log('Old subscription cleared');
      }
      
      // 3. VAPID Key Handling (Hardcoded fallback for reliability)
      const NEW_PUBLIC_KEY = 'BEhZPJKfzOYIqxZYyVu_00lJEeDLKbdmvbiMCWAn7AryF4K_n5feZdPmsIn9rXuQl07HClWw7CniRm7rOM1CgYg';
      const vapidKey = (import.meta.env.VITE_VAPID_PUBLIC_KEY || NEW_PUBLIC_KEY).trim().replace(/['"]/g, '');
      
      console.log('Subscribing with key:', vapidKey.substring(0, 10) + '...');

      let sub;
      try {
        // 4. Perform the actual subscription
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey)
        });
      } catch (subErr: any) {
        const detail = `Key: ${vapidKey.substring(0, 5)}... (Len: ${vapidKey.length})`;
        throw new Error(`Error en pushManager.subscribe: ${subErr.message}\n${detail}`);
      }

      // Send to our /api/subscribe backend
      const backendRes = await fetch('/api/subscribe', {
        method: 'POST',
        body: JSON.stringify(sub),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!backendRes.ok) {
        const data = await backendRes.json();
        const errorMsg = data.message || "Error al registrar suscripción";
        const errorDetail = data.detail ? `\nDetalle: ${data.detail}` : "";
        throw new Error(`${errorMsg}${errorDetail}`);
      }
      
      setIsSubscribed(true);
      console.log('Suscrito con éxito');
    } catch (err: any) {
      console.error('Error suscribiendo:', err);
      alert("Error al suscribirse: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeUser = async () => {
    if (!('serviceWorker' in navigator)) return;
    setIsLoading(true);

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();

      if (sub) {
        // 1. Tell the backend to delete the record
        await fetch('/api/unsubscribe', {
          method: 'POST',
          body: JSON.stringify({ endpoint: sub.endpoint }),
          headers: { 'Content-Type': 'application/json' }
        });

        // 2. Unsubscribe in the browser
        await sub.unsubscribe();
        setIsSubscribed(false);
        console.log('Desuscrito con éxito');
      }
    } catch (err: any) {
      console.error('Error desuscribiendo:', err);
      alert("Error al desuscribirse: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    if (isLoading) return;

    if (isSubscribed) {
      if (confirm("¿Deseas dejar de recibir notificaciones de feriados?")) {
        unsubscribeUser();
      }
      return;
    }

    if (!supportPush) {
      alert("Tu dispositivo no soporta notificaciones PWA. En iPhone, debes 'Añadir a inicio' primero.");
      return;
    }
    subscribeUser();
  };

  return (
    <button 
      onClick={handleClick}
      disabled={isLoading}
      className={`absolute top-4 left-4 p-3 rounded-full border shadow-sm transition-all z-50 flex items-center space-x-2 ${
        isLoading ? "opacity-50 cursor-not-allowed" : ""
      } ${
        isSubscribed 
          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
          : !supportPush
          ? "bg-gray-100 dark:bg-secondary/30 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-white/5"
          : "bg-white dark:bg-secondary/50 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-secondary/80"
      }`}
      aria-label="Notificaciones"
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isSubscribed ? (
        <>
          <span className="text-xs font-semibold px-1">Suscrito</span>
          <Bell size={20} className="hidden sm:block" />
        </>
      ) : (
        <Bell size={20} />
      )}
    </button>
  );
}
