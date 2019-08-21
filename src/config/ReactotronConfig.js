import { NativeModules } from 'react-native';
import Reactotron from 'reactotron-react-native';

const host = NativeModules.SourceCode.scriptURL.split('://')[1].split(':')[0];

if (__DEV__) {
  const tron = Reactotron.configure({
    host,
  })
    .useReactNative()
    .connect();

  console.tron = tron;

  tron.clear();
}
