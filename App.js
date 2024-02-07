import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

export default function App() {
  const [fileContents, setFileContents] = useState('');

  const pickFile = async () => {
    try {
      const pickerResult = await DocumentPicker.getDocumentAsync({
        type: 'mp3', // Specify the MIME type for audio files
      });
      if (pickerResult.type === 'success') {
        const { uri } = pickerResult;
        const contents = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64, // or FileSystem.EncodingType.UTF8
        });
        console.log(contents);
        setFileContents(contents);
      }
      else{
        console.log('there is some shit going on');
      }
    } catch (error) {
      console.log('Error picking file:', error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>File Contents:</Text>
      <Text>{fileContents}</Text>
      <Button title="Pick File" onPress={pickFile} />
    </View>
  );
}
