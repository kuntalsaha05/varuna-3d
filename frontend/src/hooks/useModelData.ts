import { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore, DatasetType } from '../state/store';

export function useModelData(datasetType: DatasetType, variable: string, depth: number, timeIndex: number) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get('http://127.0.0.1:8000/api/v1/slice/depth', {
      params: {
        dataset_type: datasetType,
        variable,
        depth,
        time_index: timeIndex
      }
    })
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [datasetType, variable, depth, timeIndex]);

  return { data, loading, error };
}
