import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TutorService } from '../services/tutorService';
import Loading from '../components/Loading';
import type { Tutor } from '../types';

const TutorList: React.FC = () => {
  const navigate = useNavigate();
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(0);

  const carregarTutores = async () => {
    setLoading(true);
    try {
      const data = await TutorService.getAll(pagina, busca);
      setTutores(data.content);
    } catch (error) { console.error("Erro ao carregar tutores"); } finally { setLoading(false); }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => carregarTutores(), 500);
    return () => clearTimeout(timeoutId);
  }, [pagina, busca]);

  if (loading && !tutores.length) return <Loading />;

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
         <h2 style={{ margin: 0, color: '#e0e0e0', fontSize: '1.5rem' }}>Tutores</h2>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="🔍 Buscar tutor..." 
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{ padding: '12px', background: '#1e1e1e', border: '1px solid #333' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {tutores.map((tutor) => (
          <div 
            key={tutor.id} 
            className="card" 
            onClick={() => navigate(`/tutores/${tutor.id}`)}
            style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
              cursor: 'pointer', padding: '12px 16px', marginBottom: 0 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
               <div style={{ 
                  width: '45px', height: '45px', borderRadius: '50%', 
                  background: tutor.foto ? `url(${tutor.foto.url}) center/cover` : '#333',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid #444', flexShrink: 0
                }}>
                  {!tutor.foto && <span className="material-icons" style={{ color: '#666', fontSize: '20px' }}>person</span>}
                </div>
              <div>
                <strong style={{ fontSize: '1rem', color: '#e0e0e0', display: 'block' }}>{tutor.nome}</strong>
                <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '2px' }}>
                  {tutor.email}
                </div>
              </div>
            </div>
            <span className="material-icons" style={{ color: '#444', fontSize: '20px' }}>chevron_right</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '25px' }}>
        <button className="btn-secondary" disabled={pagina === 0} onClick={() => setPagina(pagina - 1)}>Anterior</button>
        <span style={{alignSelf:'center', color:'#666', fontSize:'0.9rem'}}>{pagina + 1}</span>
        <button className="btn-secondary" disabled={tutores.length < 10} onClick={() => setPagina(pagina + 1)}>Próxima</button>
      </div>

      <button className="fab" onClick={() => navigate('/tutores/novo')}>
        <span className="material-icons">add</span>
      </button>
    </div>
  );
};

export default TutorList;