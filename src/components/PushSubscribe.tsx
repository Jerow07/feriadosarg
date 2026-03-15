import { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';

// Utility to convert Base64 vapid key to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushSubscribe() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [supportPush, setSupportPush] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setSupportPush(true);
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) setIsSubscribed(true);
        });
      });
    }
  }, []);

  const subscribeUser = async () => {
    if (!('serviceWorker' in navigator)) return;
    
    try {
      const reg = await navigator.serviceWorker.ready;
      
      const res = await Notification.requestPermission();
      if (res !== 'granted') {
          alert("Debes permitir las notificaciones en el teléfono primero.");
          return;
      }
      
      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        throw new Error("No VAPID key found in environment variables");
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      });

      // Send to our /api/subscribe backend
      const backendRes = await fetch('/api/subscribe', {
        method: 'POST',
        body: JSON.stringify(sub),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!backendRes.ok) {
        throw new Error("Backend devolvió error al suscribir");
      }
      
      setIsSubscribed(true);
      alert('¡Suscrito con éxito a las notificaciones PWA!');
    } catch (err: any) {
      console.error('Error suscribiendo al usuario crudo:', err);
      // Fallback a String duro para ver el root object de DOMException
      alert("ERROR CRUDO: " + String(err) + " || JSON: " + JSON.stringify(err, Object.getOwnPropertyNames(err)));
    }
  };

  const handleClick = () => {
    if (isSubscribed) {
      alert("Ya estás suscrito a las notificaciones.");
      return;
    }
    if (!supportPush) {
      alert("Tu dispositivo o navegador no soporta notificaciones aún. Si estás en iPhone, recordá que debés tocar 'Compartir' -> 'Añadir a inicio' primero, y abrir la app desde ahí.");
      return;
    }
    subscribeUser();
  };

  return (
    <button 
      onClick={handleClick}
      className={`absolute top-4 left-4 p-3 rounded-full border shadow-sm transition-colors z-50 flex items-center space-x-2 ${
        isSubscribed 
          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
          : !supportPush
          ? "bg-gray-100 dark:bg-secondary/30 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-white/5"
          : "bg-white dark:bg-secondary/50 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-secondary/80"
      }`}
      aria-label="Notificaciones"
    >
      {isSubscribed ? <span className="text-xs font-semibold px-1">Suscrito</span> : <Bell size={20} />}
      {isSubscribed && <BellOff size={20} className="hidden" />}
    </button>
  );
}
