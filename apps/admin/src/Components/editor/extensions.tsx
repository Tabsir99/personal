// // highlightExtension.js
// import { Mark } from '@tiptap/core';

// const Highlight = Mark.create({
//   name: 'highlight',

//   addOptions() {
//     return {
//       HTMLAttributes: {},
//       colors: ['yellow', 'green', 'blue'], // Define the colors you want to allow
//     };
//   },

//   addAttributes() {
//     return {
//       color: {
//         default: null,
//         parseHTML: (element) => element.style.backgroundColor || null,
//         renderHTML: (attributes) => {
//           if (!attributes.color) {
//             return {};
//           }
//           return {
//             style: `background-color: ${attributes.color}`,
//           };
//         },
//       },
//     };
//   },

//   parseHTML() {
//     return [
//       {
//         tag: 'span[style*=background-color]',
//       },
//     ];
//   },

//   renderHTML() {
//     return ['span', this.options.HTMLAttributes, 0];
//   },

//   addCommands() {
//     return {
//       setHighlight:
//         (color) =>
//         ({ commands }) => {
//           return commands.setMark(this.name, { color });
//         },
//       toggleHighlight:
//         (color) =>
//         ({ commands }) => {
//           return commands.toggleMark(this.name, { color });
//         },
//       unsetHighlight:
//         () =>
//         ({ commands }) => {
//           return commands.unsetMark(this.name);
//         },
//     };
//   },
// });

// export default Highlight;
