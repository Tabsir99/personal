// // /lib/tfidf.js

// // Tokenize the text into terms and remove short words
// const tokenize = (text) => {
//     return text
//       .toLowerCase()
//       .replace(/[^a-zA-Z0-9\s]/g, '')
//       .split(/\s+/)
//       .filter((word) => word.length > 3); // Remove stop words and short words
//   };
  
//   // Calculate term frequency for a document
//   const calculateTF = (terms, docTokens) => {
//     const tf = {};
//     terms.forEach((term) => {
//       const termFrequency = docTokens.filter((token) => token === term).length;
//       tf[term] = termFrequency / docTokens.length; // Term frequency for the current document
//     });
//     return tf;
//   };
  
//   // Calculate inverse document frequency
//   const calculateIDF = (terms, allDocsTokens) => {
//     const idf = {};
//     const docCount = allDocsTokens.length;
//     terms.forEach((term) => {
//       let count = 0;
//       allDocsTokens.forEach((docTokens) => {
//         if (docTokens.includes(term)) count++;
//       });
//       idf[term] = Math.log(docCount / (1 + count)); // Smooth to avoid division by zero
//     });
//     return idf;
//   };
  
//   // Calculate TF-IDF for each document
//   const calculateTFIDF = (docs) => {
//     // Tokenize all documents
//     const allDocsTokens = docs.map(doc => tokenize(doc));
  
    
//     // Create a set of all terms across all documents
//     const allTerms = new Set();
//     allDocsTokens.forEach((tokens) => {
//       tokens.forEach((token) => allTerms.add(token));
//     });
  

//     const idf = calculateIDF([...allTerms], allDocsTokens);
  
//     // Calculate TF-IDF for each document
//     return allDocsTokens.map((docTokens) => {
//       const tf = calculateTF([...allTerms], docTokens);
//       const tfidf = {};
//       Object.keys(tf).forEach((term) => {
//         tfidf[term] = tf[term] * idf[term];
//       });
//       return tfidf;
//     });
//   };
  
//   // Helper function to calculate cosine similarity between two vectors
//   const cosineSimilarity = (vecA, vecB) => {
//     const dotProduct = Object.keys(vecA).reduce((acc, key) => acc + (vecA[key] || 0) * (vecB[key] || 0), 0);
//     const magnitudeA = Math.sqrt(Object.values(vecA).reduce((acc, val) => acc + val * val, 0));
//     const magnitudeB = Math.sqrt(Object.values(vecB).reduce((acc, val) => acc + val * val, 0));
//     if (magnitudeA === 0 || magnitudeB === 0) return 0;
//     return dotProduct / (magnitudeA * magnitudeB);
//   };
  
//   export { calculateTFIDF, cosineSimilarity, tokenize };
  