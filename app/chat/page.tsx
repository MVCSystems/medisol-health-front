export default function ChatPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4">
        <h1 className="text-2xl font-bold">Chat Médico - Asistente IA</h1>
        <p className="text-gray-600 mt-2">
          Realiza consultas médicas generales con nuestro asistente de inteligencia artificial
        </p>
      </div>
      
      <div className="flex-1 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">
              Próximamente: Chat con IA Médica
            </h2>
            <p className="text-blue-600">
              Esta funcionalidad estará disponible pronto. Podrás hacer consultas médicas generales, 
              obtener información sobre síntomas y recibir orientación médica básica.
            </p>
            <div className="mt-4 text-sm text-blue-500">
              <p><strong>Nota:</strong> Este asistente no reemplaza la consulta médica profesional.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}