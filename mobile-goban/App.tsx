import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, ActivityIndicator, Pressable } from 'react-native';
import { WebView } from 'react-native-webview';
import React, { useRef, useState } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// 使用 ngrok 隧道，徹底解決區網連線問題
// const NEXTJS_LOCAL_URL = "https://66c1475f8ded.ngrok-free.app"; 
const NEXTJS_LOCAL_URL = "http://192.168.0.127:3000"; 
// const NEXTJS_LOCAL_URL = "http://10.0.2.2:3000"; 

export default function App() {
  const webviewRef = useRef<WebView>(null);
  const [lastMessage, setLastMessage] = useState<string>("等待落子資料...");
  const [loading, setLoading] = useState(true);

  const sendMoveToWeb = () => {
    const x = Math.floor(Math.random() * 19);
    const y = Math.floor(Math.random() * 19);
    const color = Math.random() > 0.5 ? 'white' : 'black';

    const script = `
      if (window.handleNativeMove) {
        window.handleNativeMove({ x: ${x}, y: ${y}, color: '${color}' });
      } else {
        alert('Web 端的 handleNativeMove 尚未就緒');
      }
      true;
    `;
    webviewRef.current?.injectJavaScript(script);
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      setLastMessage(`Web 傳來: ${JSON.stringify(data)}`);
    } catch (e) {
      console.error("解析訊息失敗", e);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        
        <View style={styles.header}>
          <Text style={styles.title}>KataGo Mobile 測試</Text>
          <Text style={styles.status}>{lastMessage}</Text>
        </View>

        <View style={styles.webviewContainer}>
          <WebView
            ref={webviewRef}
            source={{ uri: NEXTJS_LOCAL_URL }} 
            style={styles.webview}
            javaScriptEnabled={true}
            onMessage={handleMessage}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn("WebView Error:", nativeEvent);
              setLastMessage(`錯誤: ${nativeEvent.description}`);
              setLoading(false);
            }}
            onHttpError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn("WebView HTTP Error:", nativeEvent);
              setLastMessage(`HTTP 錯誤: ${nativeEvent.statusCode}`);
              setLoading(false);
            }}
          />
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#2196F3" />
              <Text style={{marginTop: 10}}>正在嘗試連接 {NEXTJS_LOCAL_URL}</Text>
            </View>
          )}
        </View>

        <View style={styles.controls}>
          <Pressable 
            style={({pressed}) => [styles.button, pressed && styles.buttonPressed]} 
            onPress={sendMoveToWeb}
          >
            <Text style={styles.buttonText}>模擬 AI 落子 (隨機)</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
