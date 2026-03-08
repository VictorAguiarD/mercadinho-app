---
marp: true
theme: default
class: lead
backgroundColor: #f4f6f9
---

# 🛒 Projeto Mercadinho Inteligente
### Um Dashboard Completo e Dinâmico

*Sistema focado em facilidade, visão de negócios e alta responsividade visual.*

---

# 📊 Visão Geral do Sistema

O projeto **Mercadinho** foi aprimorado para fornecer uma experiência visual premium diretamente pelo navegador ou **via Smartphone**, utilizando o GitHub Pages.

![](https://raw.githubusercontent.com/VictorAguiarD/mercadinho-app/main/img/dashboard-preview.png)
*(Modo Responsivo Integrado)*

---

# 📈 Funcionalidades Adicionadas

1. **Dashboard de Análise e Previsão:**
   - Gráfico de **Faturamento Diário** (Últimos 7 dias).
   - Relatório em Pizza dos **Top 5 Produtos**.
   - **Inteligência:** Cálculo automático de previsão de vendas com base no histórico residente da loja.

2. **Isolamento de Frontend:**
   - Frontend **100% autônomo** (HTML/JS/CSS limpo).
   - Servido livremente através do **GitHub Pages** sem necessidades iniciais de servidor back-end (`Modo Mock`).

---

# 📱 Design & Experiência (UX)

- Cores adaptativas e *Hover-Scale* nos cartões de métricas.
- Alertas de Estoque integrados no painel principal.
- **Microinterações:** Sistema de *Toasts* (Toast Notifications do Bootstrap 5) avisam sobre sucessos ou falhas discretamente na tela principal, como um App Nativo.

---

# 🚀 Arquitetura & Cloud

- **GitHub Pages:**
  - Código fonte modular e leve posicionado na "raiz" (Root) do repositório para integração contínua (CI/CD) com GitHub Actions.
- **Híbrido e Simulado:**
  - Quando em ambiente local, acessa as portas REST (`localhost:3000`).
  - No celular (Github), carrega o `Modo Demonstração` para encantar clientes imediatamente sem problemas de *Cross-Origin*.

---

# 🔗 Conclusão e Próximos Passos

O sistema está de pé!

- ✅ **Acessibilidade:** Você e seus clientes podem abrir o [mercadinho-app](https://victoraguiard.github.io/mercadinho-app/) de qualquer aparelho celular em qualquer parte do mundo.
- ✅ **Backend Pronto:** Quando necessário evoluir do "Modo Portfólio" para um "Modo Comercial", basta conectar a um provedor Nuvem.

*Desenvolvido com excelência.*
