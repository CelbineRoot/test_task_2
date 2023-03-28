const fs = require('fs');
const readline = require('readline');
// определяем путь к исходному файлу
const inputFilePath = 'path/to/input/file';
// определяем путь к выходному файлу
const outputFilePath = 'path/to/output/file';
// определяем количество файлов, на которые будем разбивать исходный файл
const chunkCount = 1000;
// определяем размер каждого файла-части (в байтах)
const chunkSize = Math.ceil(fs.statSync(inputFilePath).size / chunkCount);
// создаем массив с именами файлов-частей
const chunkFilePaths = Array.from({ length: chunkCount }, (_, i) => `path/to/chunk/file-${i+1}.txt`);
// разбиваем исходный файл на части
let currentChunkIndex = 0;
let currentChunkSize = 0;
let currentChunkStream = null;
const inputStream = fs.createReadStream(inputFilePath);
const rl = readline.createInterface({ input: inputStream });
rl.on('line', (line) => {
  if (!currentChunkStream || currentChunkSize + line.length > chunkSize) {
    if (currentChunkStream) {
      currentChunkStream.end();
      currentChunkIndex++;
      currentChunkSize = 0;
    }
    currentChunkStream = fs.createWriteStream(chunkFilePaths[currentChunkIndex]);
  }
  currentChunkStream.write(`${line}\n`);
  currentChunkSize += line.length + 1; // добавляем 1 байт на символ новой строки
});
rl.on('close', () => {
  if (currentChunkStream) {
    currentChunkStream.end();
  }
  sortAndMergeChunks();
});
// сортируем части и объединяем их в итоговый файл
function sortAndMergeChunks() {
  const chunkStreams = chunkFilePaths.map((path) => fs.createReadStream(path));
  const outputStream = fs.createWriteStream(outputFilePath);
  const mergeStreams = require('merge-stream')(chunkStreams);
  mergeStreams
      .pipe(require('sort-stream')()) // сортировка строк
      .pipe(outputStream); // запись отсортированных строк в итоговый файл
}