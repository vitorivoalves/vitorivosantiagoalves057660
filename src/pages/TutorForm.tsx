import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { maskPhone, maskCPF } from '../utils/masks'; // Certifique-se de exportar maskCPF no utils
import Loading from '../components/Loading';

// Interface alinhada com ProprietarioRequestDto
interface TutorFormData {
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  cpf: string; // String no formulário para suportar a máscara
}

const TutorForm: React.FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<TutorFormData>();
  const [loading, setLoading] = useState(false);
  
  const onSubmit = async (data: TutorFormData) => {
    setLoading(true);
    try {
      // Conversão necessária: CPF deve ser enviado apenas como números (int64) para a API
      // Remove pontos e traços
      const cpfNumerico = Number(data.cpf.replace(/\D/g, ''));

      const payload = {
        ...data,
        cpf: cpfNumerico
      };

      await api.post('/v1/tutores', payload);
      
      alert('Tutor cadastrado com sucesso!');
      navigate('/pets'); // Ou navegue para a lista de tutores se houver
    } catch (error) {
      console.error("Erro ao salvar tutor:", error);
      alert('Erro ao salvar. Verifique se o CPF ou E-mail já estão cadastrados.');
    } finally {
      setLoading(false);
    }
  };

  // Handler de máscara para telefone
  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = maskPhone(event.target.value);
    setValue("telefone", maskedValue, { shouldValidate: true });
  };

  // Handler de máscara para CPF
  const handleCPFChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Se você ainda não tem maskCPF no utils, use uma lógica simples ou adicione lá
    // Exemplo simples se a função não existir: v.replace(/\D/g, '') ...
    const maskedValue = maskCPF(event.target.value); 
    setValue("cpf", maskedValue, { shouldValidate: true });
  };

  if (loading) return <Loading />;

  return (
    <div className="container" style={{ maxWidth: '600px', paddingTop: '40px' }}>
       <button onClick={() => navigate('/pets')} className="btn-secondary" style={{ marginBottom: '20px' }}>
        &larr; Voltar
      </button>

      <h2>Cadastro de Tutor</h2>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        
        {/* Nome - Obrigatório [cite: 1063] */}
        <label>Nome Completo</label>
        <input 
          {...register("nome", { required: "Nome é obrigatório" })} 
          placeholder="Ex: João da Silva" 
        />
        {errors.nome && <span style={{ color: '#e57373', fontSize: '12px' }}>{errors.nome.message}</span>}

        {/* E-mail - Obrigatório [cite: 1068] */}
        <label>E-mail Corporativo ou Pessoal</label>
        <input 
          type="email"
          {...register("email", { 
            required: "E-mail é obrigatório",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "E-mail inválido"
            }
          })} 
          placeholder="exemplo@email.com" 
        />
        {errors.email && <span style={{ color: '#e57373', fontSize: '12px' }}>{errors.email.message}</span>}

        {/* CPF - Obrigatório [cite: 1083] */}
        <label>CPF</label>
        <input 
          {...register("cpf", { 
            required: "CPF é obrigatório",
            minLength: { value: 14, message: "CPF incompleto" }, // 11 números + formatação
            maxLength: { value: 14, message: "CPF inválido" }
          })} 
          placeholder="000.000.000-00" 
          onChange={handleCPFChange}
          maxLength={14}
        />
        {errors.cpf && <span style={{ color: '#e57373', fontSize: '12px' }}>{errors.cpf.message}</span>}

        {/* Telefone com Máscara - [cite: 1074] */}
        <label>Telefone de Contato</label>
        <input 
          {...register("telefone", { 
            required: "Telefone é obrigatório",
            minLength: { value: 14, message: "Telefone incompleto" }
          })}
          placeholder="(XX) 99999-9999"
          onChange={handlePhoneChange}
          maxLength={15}
        />
        {errors.telefone && <span style={{ color: '#e57373', fontSize: '12px' }}>{errors.telefone.message}</span>}

        {/* Endereço - [cite: 1079] */}
        <label>Endereço Residencial</label>
        <input 
          {...register("endereco", { required: "Endereço é obrigatório" })} 
          placeholder="Logradouro, Número, Bairro" 
        />
        {errors.endereco && <span style={{ color: '#e57373', fontSize: '12px' }}>{errors.endereco.message}</span>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Registro'}
        </button>
      </form>
    </div>
  );
};

export default TutorForm;