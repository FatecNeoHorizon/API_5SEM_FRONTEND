# API_5SEM_FRONTEND

## Como usar o AppLayout

Para garantir consistência visual em todas as telas, utilize o componente `AppLayout` para envolver o conteúdo de qualquer página. O `AppLayout` renderiza o Header fixo no topo e um container para o conteúdo dinâmico.

### Exemplo de uso

```jsx
import AppLayout from './src/layout/AppLayout';

function MinhaPagina() {
  return (
    <AppLayout>
      {/* Conteudo da pagina */}
      <h1>Bem-vindo à Dashboard!</h1>
    </AppLayout>
  );
}
```

- O Header com logo e navegação será exibido no topo.
- O conteúdo passado como children será renderizado abaixo do Header.
- O layout é responsivo: em telas pequenas, a navegação vira menu hambúrguer.

> **Dica:** Use o `AppLayout` em todas as páginas principais para manter o padrão visual da aplicação.