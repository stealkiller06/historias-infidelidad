import "./App.css";

function App() {
  return (
    <div className="page">
      <div className="closure-notice">
        <div className="closure-icon">🔒</div>
        <h1>Página Cerrada</h1>
        <div className="closure-message">
          <p>
            Esta página ha sido cerrada debido a que podria contener datos privados o sensibles
          </p>
          <p>
            Pedimos disculpas por cualquier inconveniente y agradecemos su comprensión.
          </p>
        </div>
        <div className="closure-footer">
          <p>Si tiene preguntas o inquietudes, por favor contacte al administrador.</p>
        </div>
      </div>
    </div>
  );
}

export default App;