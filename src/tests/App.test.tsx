import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Loading from '../components/Loading';

describe('Componente Loading', () => {
  it('deve renderizar o texto de carregamento', () => {
    render(<Loading />);
    expect(screen.getByText(/CARREGANDO.../i)).toBeInTheDocument();
  });
});