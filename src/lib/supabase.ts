import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';

// Cliente único do Supabase. Só a URL e a chave PUBLICÁVEL ficam no app;
// o acesso real aos dados é limitado pelas políticas RLS do banco.
// A sessão (token) é guardada no AsyncStorage pelo próprio SDK, que também a renova.
export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      lock: processLock,
    },
  },
);
