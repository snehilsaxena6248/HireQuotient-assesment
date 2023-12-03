import { useEffect, useState } from "react";
import Datatable from "./components/Datatable.jsx";
function App() {
  const [originalData, setOriginalData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const fetchedData = await fetch(
        "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"
      );
      const data = await fetchedData.json();
      setOriginalData(data);
    };
    fetchData();
  }, []);

  const handleDeleteMultiple = (ids) => {
    const filteredRows = originalData.filter((row) => {
      return !ids.includes(row.id);
    });
    setOriginalData(filteredRows);
  };

  const handleDeleteSingle = (id) => {
    const filteredRows = originalData.filter((row) => row.id !== id);
    setOriginalData(filteredRows);
  };

  return (
    <div className="App">
      <Datatable
        originalData={originalData}
        handleDeleteMultiple={handleDeleteMultiple}
        handleDeleteSingle={handleDeleteSingle}
      />
    </div>
  );
}

export default App;
