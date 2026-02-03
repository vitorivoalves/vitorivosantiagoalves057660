import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import { PetService, type Pet } from '../services/petService';

const PetList: React.FC = () => {
  const navigate = useNavigate();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de Filtro e Paginação
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(0);

  const carregarPets = async () => {
    setLoading(true);
    // Busca os dados (se falhar, o Service usa o Mock silenciosamente)
    const { data } = await PetService.getAll(pagina, busca);
    setPets(data);
    setLoading(false);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => carregarPets(), 500);
    return () => clearTimeout(timeoutId);
  }, [pagina, busca]);

  if (loading) return <Loading />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Gestão de Pets</h2>
      </div>

      {/* AVISO REMOVIDO DAQUI */}
      
      <div style={{ marginBottom: '25px' }}>
        <input 
          type="text" 
          placeholder="🔍 Filtrar por nome..." 
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setPagina(0);
          }}
          style={{ textAlign: 'center' }}
        />
      </div>

      <div>
          {pets.length === 0 ? (
            <div style={{ color: '#666', marginTop: '60px', textAlign: 'center' }}>
              <span className="material-icons" style={{ fontSize: '48px', marginBottom: '10px', display: 'block' }}>pets</span>
              Nenhum registro encontrado.
            </div>
          ) : (
            pets.map((pet) => (
              <div 
                key={pet.id} 
                className="card" 
                onClick={() => navigate(`/pets/${pet.id}`)}
              >
                  {pet.urlFoto ? (
                    <img src={pet.urlFoto} alt={pet.nome} className="pet-avatar" />
                  ) : (
                    <div className="pet-avatar-placeholder">
                      <span className="material-icons" style={{ color: '#666' }}>pets</span>
                    </div>
                  )}

                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '1.2rem', color: '#fff', display: 'block', marginBottom: '4px' }}>{pet.nome}</strong>
                    <span style={{ fontSize: '0.9rem', color: '#aaa', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span className="material-icons" style={{ fontSize: '14px' }}>category</span> {pet.especie || 'Pet'} • {pet.raca}
                    </span>
                  </div>

                  <span className="material-icons" style={{ color: '#555' }}>chevron_right</span>
              </div>
            ))
          )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '30px' }}>
        <button className="btn-secondary" disabled={pagina === 0} onClick={() => setPagina(pagina - 1)}>
            Anterior
        </button>
        <span style={{ alignSelf: 'center', color: '#666', fontSize: '0.9rem' }}>Página {pagina + 1}</span>
        <button className="btn-secondary" disabled={pets.length < 10} onClick={() => setPagina(pagina + 1)}>
            Próxima
        </button>
      </div>

      <button 
        className="btn-primary btn-float" 
        onClick={() => navigate('/pets/novo')}
        aria-label="Adicionar novo registro"
      >
        +
      </button>
    </div>
  );
};

export default PetList;