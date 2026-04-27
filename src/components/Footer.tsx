export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            NoteHub - Condividi e trova appunti della scuola
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-2 md:mt-0">
            Realizzato per studenti, dagli studenti
          </p>
        </div>
      </div>
    </footer>
  );
}