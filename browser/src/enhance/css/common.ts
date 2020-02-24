export default `
::-webkit-scrollbar-track-piece {
  width: 5px;
  background-color: #f9f9f9;
}

::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

::-webkit-scrollbar-thumb {
  height: 10px;
  background: radial-gradient(circle, #35a2ff 0%, #014a88 100%);
  cursor: pointer;
}

::-webkit-scrollbar-thumb:hover {
  background: radial-gradient(circle, #35a2ff 0%, #014a88 100%);
  cursor: pointer;
}
* {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
html, * {
  -webkit-user-select:text !important;
  -moz-user-select:text !important;
  user-select:text !important;
}
`;
