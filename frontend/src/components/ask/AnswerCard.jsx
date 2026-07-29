const AnswerCard = ({
    loading,
    answer,
  }) => {
  
    if (loading) {
      return (
        <div className="mt-8 bg-slate-900 rounded-2xl p-6 animate-pulse">
  
          <div className="h-5 bg-slate-700 rounded w-1/3 mb-4"></div>
  
          <div className="space-y-3">
  
            <div className="h-4 bg-slate-700 rounded"></div>
  
            <div className="h-4 bg-slate-700 rounded"></div>
  
            <div className="h-4 bg-slate-700 rounded w-2/3"></div>
  
          </div>
  
        </div>
      );
    }
  
    return (
      <div className="mt-8 bg-slate-900 rounded-2xl border border-slate-800 p-6">
  
        <h2 className="text-xl font-semibold mb-4">
          🤖 AI Answer
        </h2>
  
        <p className="leading-8 text-slate-300">
          {answer}
        </p>
  
      </div>
    );
  };
  
  export default AnswerCard;