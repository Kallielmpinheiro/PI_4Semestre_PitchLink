import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { InvestmentSummary } from '../../../shared/interfaces/common.interfaces';
import { AuthService } from '../../../core/services/auth.service';
import jsPDF from 'jspdf';

interface ProposalData {
  id: number;
  created: string;
  modified: string;
  investor_id: number;
  investor_name: string;
  investor_last_name: string;
  investor_email: string;
  investor_img_url: string | null;
  sponsored_id: number;
  sponsored_name: string;
  sponsored_last_name: string;
  sponsored_email: string;
  sponsored_img_url: string | null;
  innovation_id: number;
  innovation_name: string;
  descricao: string;
  investimento_minimo: number;
  porcentagem_cedida: number;
  accepted: boolean;
  status: string;
  user_role: 'investor' | 'sponsored';
  paid: boolean;
}

@Component({

  selector: 'app-negocios-fechados',
  imports: [CommonModule, FormsModule],
  templateUrl: './negocios-fechados.component.html',
  styleUrl: './negocios-fechados.component.css'
})

export class NegociosFechadosComponent implements OnInit {

  private readonly authService = inject(AuthService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly router = inject(Router);

  proposals: ProposalData[] = [];
  filteredProposals: ProposalData[] = [];
  loading = true;
  error = '';
  selectedProposal: ProposalData | null = null;
  statusFilter = 'all';
  sortBy = 'date';
  showPaymentModal = false;
  paymentLoading = false;
  paymentError = '';
  paymentSuccess = false;
  selectedPaymentProposal: ProposalData | null = null;
  
  showPdfGenerator = false;
  pdfUrl: SafeResourceUrl | null = null;
  pdfFormData = {
    title: '',
    subtitle: '',
    description: '',
    includeFinancialData: true,
    includeParticipants: true,
    includeTimeline: false,
    logoUrl: '',
    headerColor: '#3B82F6',
    footerText: 'Documento gerado automaticamente',
    documentType: 'cpf' as 'cpf' | 'cnpj',
    documentNumber: '',
    signerName: '',
    signerEmail: '',
    acceptSignature: false
  };

  signatureSecurityInfo = {
    timestamp: '',
    userAgent: '',
    platform: '',
    language: '',
    screenResolution: '',
    timezone: '',
    ipAddress: ''
  };

  signatureStatus: any = null;
  signatureStatusLoading = false;
  signatureStatusError = '';


  showSignatureModal = false;
  signatureData: any = null;
  signatureLoading = false;
  signatureError = '';

  private generateInvestmentSummary(proposal: ProposalData): InvestmentSummary {
    const now = new Date();
    const proposalDate = new Date(proposal.created);
    const acceptanceDate = new Date(proposal.modified);
    const baseAmount = proposal.investimento_minimo;
    const fees = baseAmount * 0.02;
    const taxes = baseAmount * 0.05;
    const finalAmount = baseAmount + fees + taxes;
    const expectedROI = (proposal.porcentagem_cedida / 100) * baseAmount * 2;
    
    let riskLevel: 'low' | 'medium' | 'high' = 'medium';
    if (baseAmount < 50000) riskLevel = 'low';
    else if (baseAmount > 200000) riskLevel = 'high';
    
    const expectedReturnDate = new Date(acceptanceDate);
    expectedReturnDate.setFullYear(expectedReturnDate.getFullYear() + 2);
    
    return {
      totalInvestment: baseAmount,
      investorEquity: proposal.porcentagem_cedida,
      sponsoredEquity: 100 - proposal.porcentagem_cedida,
      expectedROI,
      paymentStatus: proposal.paid ? 'paid' : 'pending',
      investmentBreakdown: {
        baseAmount,
        fees,
        taxes,
        finalAmount
      },
      timeline: {
        proposalDate: proposal.created,
        acceptanceDate: proposal.modified,
        paymentDate: proposal.paid ? proposal.modified : undefined,
        expectedReturnDate: expectedReturnDate.toISOString()
      },
      riskLevel,
      category: 'Inovação e Tecnologia'
    };
  }
  
  ngOnInit(): void {
    this.loadProposals();
  }

  loadProposals(): void {
    this.loading = true;
    this.authService.proposal().subscribe({
      next: (response) => {
        if (response.data) {
          this.proposals = response.data;
          this.applyFilters();
        }
        this.loading = false;
      },
    });
  }

  applyFilters(): void {
    let filtered = [...this.proposals];

    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(proposal => proposal.status === this.statusFilter);
    }

    switch (this.sortBy) {
      case 'date':
        filtered.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
        break;
      case 'value':
        filtered.sort((a, b) => b.investimento_minimo - a.investimento_minimo);
        break;
      case 'roi':
        filtered.sort((a, b) => b.porcentagem_cedida - a.porcentagem_cedida);
        break;
      case 'paid':
        filtered.sort((a, b) => Number(a.paid) - Number(b.paid));
        break;
    }

    this.filteredProposals = filtered;
  }

  onStatusFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.statusFilter = target.value;
    this.applyFilters();
  }

  onSortChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.sortBy = target.value;
    this.applyFilters();
  }

  openModal(proposal: ProposalData): void {
    this.selectedProposal = proposal;
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
      modalOverlay.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  }

  closeModal(): void {
    this.selectedProposal = null;
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
      modalOverlay.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelada';
      case 'rejected':
        return 'Rejeitada';
      case 'accepted_request':
        return 'Aceita - Solicitação';
      case 'accepted_proposal':
        return 'Aceita - Proposta';
      case 'accepted_contract':
        return 'Aceita - Contrato';
      case 'completed':
        return 'Finalizada';
      default:
        console.log('Status não reconhecido:', status);
        return 'Desconhecido';
    }
  }

  getPaymentStatus(proposal: ProposalData): string {
    return proposal.paid ? 'Pago' : 'Pendente';
  }

  getPaymentStatusColor(proposal: ProposalData): string {
    return proposal.paid ? 'text-green-400' : 'text-orange-400';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('pt-BR');
  }

  getParticipantName(proposal: ProposalData): string {
    return proposal.user_role === 'investor' 
      ? proposal.sponsored_name 
      : proposal.investor_name;
  }

  getParticipantRole(proposal: ProposalData): string {
    return proposal.user_role === 'investor' 
      ? 'Criador da Ideia' 
      : 'Investidor';
  }

  getCurrentUserRole(proposal: ProposalData): string {
    return proposal.user_role === 'investor' 
      ? 'Investidor' 
      : 'Criador da Ideia';
  }

  shouldShowPayButton(proposal: ProposalData): boolean {
    return (proposal.status === 'accepted_request' || 
            proposal.status === 'accepted_proposal' || 
            proposal.status === 'accepted_contract' || 
            proposal.status === 'completed') 
           && !proposal.paid 
           && proposal.user_role === 'investor';
  }

  getProfileImageUrl(imageUrl: string | null, name: string): string {
    if (imageUrl && imageUrl.trim() !== '') {
      return imageUrl;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;
  }


  

  async openPdfGenerator(): Promise<void> {
  if (!this.selectedProposal) return;
  
  // Primeiro verifica se já existem assinaturas
  await this.checkExistingSignatures(this.selectedProposal.id);
  
  // Se já tem assinaturas (usuário já assinou), mostra o modal de assinaturas ao invés do gerador
  if (this.signatureData && this.signatureData.current_user.has_signed) {
    this.showSignatureModal = true;
    document.body.style.overflow = 'hidden';
    return;
  }
  
  // Se não tem assinaturas, continua com o fluxo normal do gerador de PDF
  this.captureSecurityInfo();    
  this.checkContractSignatureStatus(this.selectedProposal.id);
  
  this.pdfFormData = {
    title: `Contrato de Sociedade - ${this.selectedProposal.innovation_name}`,
    subtitle: `Acordo entre ${this.selectedProposal.investor_name} ${this.selectedProposal.investor_last_name} e ${this.selectedProposal.sponsored_name} ${this.selectedProposal.sponsored_last_name}`,
    description: this.selectedProposal.descricao,
    includeFinancialData: true,
    includeParticipants: true,
    includeTimeline: true,
    logoUrl: '',
    headerColor: '#2563EB',
    footerText: `Contrato gerado em ${this.formatDateTime(new Date().toISOString())}`,
    documentType: 'cpf' as 'cpf' | 'cnpj',
    documentNumber: '',
    signerName: this.selectedProposal.user_role === 'investor' 
      ? `${this.selectedProposal.investor_name} ${this.selectedProposal.investor_last_name}` 
      : `${this.selectedProposal.sponsored_name} ${this.selectedProposal.sponsored_last_name}`,
    signerEmail: this.selectedProposal.user_role === 'investor' 
      ? this.selectedProposal.investor_email 
      : this.selectedProposal.sponsored_email,
    acceptSignature: false
  };
  
  this.showPdfGenerator = true;
  this.updatePdfPreview();
}

  closePdfGenerator(): void {
    this.showPdfGenerator = false;
    this.pdfUrl = null;
  }

  updatePdfPreview(): void {
    if (!this.selectedProposal) return;
        this.generatePdfBlob().then(blob => {
      const url = URL.createObjectURL(blob);
      this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    });
  }

  async downloadPdf(): Promise<void> {
    if (!this.selectedProposal) return;
    
    if (!this.canSignDocument()) {
      console.log('Por favor, preencha todos os campos obrigatórios e aceite os termos para assinar o documento.');
      return;
    }    
    this.captureSecurityInfo();
    
    const signButton = document.querySelector('[data-sign-button]') as HTMLButtonElement;
    if (signButton) {
      signButton.disabled = true;
      signButton.innerHTML = '<svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg><span>Processando...</span>';
    }
    
    try {
      const pdfBlob = await this.generatePdfBlob();
      const fileName = `contrato-assinado-${this.selectedProposal.id}-${this.selectedProposal.innovation_name.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      const backendPayload = this.prepareSignatureForBackend();
      
      await this.authService.signatureContract(
        this.selectedProposal.id,
        backendPayload.contractDetails,
        backendPayload.securityInfo,
        backendPayload.signatureInfo,
        pdfBlob,
        fileName
      ).toPromise();
      
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.closePdfGenerator();
      
    } catch (error: any) {
      console.error(error);
      
    } finally {
      if (signButton) {
        signButton.disabled = false;
        signButton.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><span>Assinar e Baixar PDF</span>';
      }
    }
  }

  private getRiskLevelText(riskLevel: 'low' | 'medium' | 'high'): string {
    switch (riskLevel) {
      case 'low': return 'Baixo Risco';
      case 'medium': return 'Risco Moderado';
      case 'high': return 'Alto Risco';
      default: return 'Risco Não Definido';
    }
  }

  private addInvestmentSummaryToPdf(pdf: any, investmentSummary: InvestmentSummary, addText: Function, addSpace: Function, addDivider: Function): void {
    // SEÇÃO DE RESUMO DO INVESTIMENTO
    addDivider();
    addText('RESUMO EXECUTIVO DO INVESTIMENTO', 14, true, true);
    addDivider();
    addSpace(10);

    // Informações básicas do investimento
    addText('INFORMAÇÕES GERAIS:', 12, true);
    addSpace(5);
    addText(`Projeto: ${this.selectedProposal!.innovation_name}`, 11);
    addText(`Categoria: ${investmentSummary.category}`, 11);
    addText(`Nível de Risco: ${this.getRiskLevelText(investmentSummary.riskLevel)}`, 11);
    addText(`Status do Pagamento: ${this.getPaymentStatus(this.selectedProposal!)}`, 11);
    addSpace(10);

    // Breakdown financeiro
    addText('ANÁLISE FINANCEIRA DETALHADA:', 12, true);
    addSpace(5);
    addText(`Valor Base do Investimento: ${this.formatCurrency(investmentSummary.investmentBreakdown.baseAmount)}`, 11);
    addText(`Taxa da Plataforma (2%): ${this.formatCurrency(investmentSummary.investmentBreakdown.fees)}`, 11);
    addText(`Impostos Estimados (5%): ${this.formatCurrency(investmentSummary.investmentBreakdown.taxes)}`, 11);
    addText(`Valor Total Estimado: ${this.formatCurrency(investmentSummary.investmentBreakdown.finalAmount)}`, 11, true);
    addSpace(10);

    // Participação societária
    addText('ESTRUTURA DE PARTICIPAÇÃO:', 12, true);
    addSpace(5);
    addText(`Participação do Investidor: ${investmentSummary.investorEquity}%`, 11);
    addText(`Participação do Idealizador: ${investmentSummary.sponsoredEquity}%`, 11);
    addText(`ROI Projetado (24 meses): ${this.formatCurrency(investmentSummary.expectedROI)}`, 11);
    addSpace(10);

    // Timeline do investimento
    addText('CRONOGRAMA DO INVESTIMENTO:', 12, true);
    addSpace(5);
    addText(`Data da Proposta: ${this.formatDate(investmentSummary.timeline.proposalDate)}`, 11);
    addText(`Data de Aceitação: ${this.formatDate(investmentSummary.timeline.acceptanceDate)}`, 11);
    if (investmentSummary.timeline.paymentDate) {
      addText(`Data do Pagamento: ${this.formatDate(investmentSummary.timeline.paymentDate)}`, 11);
    }
    addText(`Retorno Esperado: ${this.formatDate(investmentSummary.timeline.expectedReturnDate!)}`, 11);
    addSpace(15);
  }

  private async generatePdfBlob(): Promise<Blob> {
    if (!this.selectedProposal) return new Blob();
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;
    const investmentSummary = this.generateInvestmentSummary(this.selectedProposal);
    const addText = (text: string, fontSize: number = 12, isBold: boolean = false, isCenter: boolean = false) => {
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
      
      if (isCenter) {
        const textWidth = pdf.getTextWidth(text);
        const x = (pageWidth - textWidth) / 2;
        pdf.text(text, x, yPosition);
      } else {
        const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
        pdf.text(lines, margin, yPosition);
        yPosition += (lines.length - 1) * 6;
      }
      yPosition += fontSize * 0.6;
    };

    const addSpace = (space: number = 6) => {
      yPosition += space;
    };

    const addDivider = () => {
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;
    };

    // Cabeçalho do documento
    pdf.setTextColor(0, 0, 0);
    addText('INSTRUMENTO PARTICULAR DE CONTRATO DE SOCIEDADE', 16, true, true);
    addText('PARA PARTICIPAÇÃO EM PROJETO DE INOVAÇÃO', 14, true, true);
    addSpace(15);

    // Preâmbulo
    const currentDate = new Date().toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
    
    addText(`Pelo presente instrumento particular, celebrado nesta data de ${currentDate}, entre as partes abaixo qualificadas:`, 12);
    addSpace(10);

    // Adicionar resumo de investimento detalhado
    this.addInvestmentSummaryToPdf(pdf, investmentSummary, addText, addSpace, addDivider);

    // Verificar se precisa de nova página
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      yPosition = margin;
    }

    // Identificação das partes
    addText('QUALIFICAÇÃO DAS PARTES:', 14, true);
    addSpace(8);

    addText(`INVESTIDOR: ${this.selectedProposal.investor_name.toUpperCase()} ${this.selectedProposal.investor_last_name.toUpperCase()}`, 12, true);
    addText(`Identificação: ${this.selectedProposal.investor_id}`, 11);
    addText(`Email: ${this.selectedProposal.investor_email}`, 11);
    addText(`Doravante denominado "INVESTIDOR"`, 11);
    addSpace(8);

    addText(`IDEALIZADOR: ${this.selectedProposal.sponsored_name.toUpperCase()} ${this.selectedProposal.sponsored_last_name.toUpperCase()}`, 12, true);
    addText(`Identificação: ${this.selectedProposal.sponsored_id}`, 11);
    addText(`Email: ${this.selectedProposal.sponsored_email}`, 11);
    addText(`Doravante denominado "IDEALIZADOR"`, 11);
    addSpace(8);

    addText(`PROJETO: ${this.selectedProposal.innovation_name.toUpperCase()}`, 12, true);
    addText(`Doravante denominado "PROJETO"`, 11);
    addSpace(15);

    // Considerandos
    addText('CONSIDERANDO QUE:', 12, true);
    addSpace(5);
    
    const considerandos = [
      'O IDEALIZADOR é detentor dos direitos sobre o projeto de inovação acima identificado;',
      'O INVESTIDOR tem interesse em participar do desenvolvimento e exploração comercial do PROJETO;',
      'As partes desejam estabelecer os termos e condições para tal participação;'
    ];

    considerandos.forEach((considerando, index) => {
      addText(`${String.fromCharCode(97 + index)}) ${considerando}`, 11);
      addSpace(3);
    });

    addSpace(10);
    addText('Resolvem celebrar o presente contrato, mediante as seguintes cláusulas e condições:', 12);
    addSpace(15);

    // Cláusulas do contrato
    addText('CLÁUSULA PRIMEIRA - DO OBJETO', 12, true);
    addSpace(3);
    const objetoText = `1.1. O presente contrato tem por objeto a participação societária do INVESTIDOR no PROJETO "${this.selectedProposal.innovation_name}", conforme descrição: ${this.selectedProposal.descricao}`;
    addText(objetoText, 11);
    addSpace(10);

    addText('CLÁUSULA SEGUNDA - DO INVESTIMENTO E PARTICIPAÇÃO', 12, true);
    addSpace(3);
    addText(`2.1. O INVESTIDOR compromete-se a aportar o valor total de ${this.formatCurrency(this.selectedProposal.investimento_minimo)} (${this.numberToWords(this.selectedProposal.investimento_minimo)}) no PROJETO.`, 11);
    addSpace(5);
    addText(`2.2. Em contrapartida ao investimento realizado, o INVESTIDOR fará jus a ${this.selectedProposal.porcentagem_cedida}% (${this.numberToWords(this.selectedProposal.porcentagem_cedida)} por cento) de participação nos resultados, lucros e direitos patrimoniais do PROJETO.`, 11);
    addSpace(5);
    addText(`2.3. O IDEALIZADOR manterá ${100 - this.selectedProposal.porcentagem_cedida}% (${this.numberToWords(100 - this.selectedProposal.porcentagem_cedida)} por cento) dos direitos sobre o PROJETO.`, 11);
    addSpace(10);

    // Verificar se precisa de nova página
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      yPosition = margin;
    }

    addText('CLÁUSULA TERCEIRA - DAS OBRIGAÇÕES DAS PARTES', 12, true);
    addSpace(3);
    addText('3.1. Constituem obrigações do IDEALIZADOR:', 11, true);
    addSpace(3);
    const obrigacoesIdealizador = [
      'Desenvolver o PROJETO conforme especificações técnicas acordadas;',
      'Utilizar os recursos investidos de forma transparente e eficiente;',
      'Prestar contas mensais sobre o andamento do PROJETO;',
      'Manter sigilo sobre informações confidenciais do INVESTIDOR.'
    ];
    
    obrigacoesIdealizador.forEach((obrigacao, index) => {
      addText(`a.${index + 1}) ${obrigacao}`, 10);
      addSpace(3);
    });

    addSpace(5);
    addText('3.2. Constituem obrigações do INVESTIDOR:', 11, true);
    addSpace(3);
    const obrigacoesInvestidor = [
      'Realizar o aporte financeiro conforme acordado;',
      'Participar das decisões estratégicas do PROJETO quando solicitado;',
      'Manter sigilo sobre informações confidenciais do IDEALIZADOR.'
    ];
    
    obrigacoesInvestidor.forEach((obrigacao, index) => {
      addText(`b.${index + 1}) ${obrigacao}`, 10);
      addSpace(3);
    });

    addSpace(10);

    addText('CLÁUSULA QUARTA - DA DISTRIBUIÇÃO DE RESULTADOS', 12, true);
    addSpace(3);
    addText('4.1. Os lucros, dividendos e demais resultados financeiros do PROJETO serão distribuídos na proporção das participações estabelecidas na Cláusula Segunda.', 11);
    addSpace(5);
    addText('4.2. A distribuição ocorrerá semestralmente, após a apuração dos resultados.', 11);
    addSpace(10);

    addText('CLÁUSULA QUINTA - DA PROPRIEDADE INTELECTUAL', 12, true);
    addSpace(3);
    addText('5.1. Os direitos de propriedade intelectual serão compartilhados conforme as participações estabelecidas neste contrato.', 11);
    addSpace(5);
    addText('5.2. Qualquer nova criação ou aperfeiçoamento do PROJETO será regido pelos mesmos percentuais de participação.', 11);
    addSpace(10);

    addText('CLÁUSULA SEXTA - DA VIGÊNCIA E RESCISÃO', 12, true);
    addSpace(3);
    addText('6.1. Este contrato entra em vigor na data de sua assinatura digital e tem prazo indeterminado.', 11);
    addSpace(5);
    addText('6.2. O contrato poderá ser rescindido por mútuo acordo ou por descumprimento de suas cláusulas.', 11);
    addSpace(10);

    addText('CLÁUSULA SÉTIMA - DO FORO', 12, true);
    addSpace(3);
    addText('7.1. As partes elegem o foro da comarca de sua residência para dirimir quaisquer questões oriundas deste contrato.', 11);
    addSpace(15);

    // Verificar se precisa de nova página para assinatura
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = margin;
    }

    // Informações do sistema
    addText('INFORMAÇÕES DO SISTEMA:', 12, true);
    addSpace(5);
    addText(`ID do Contrato: #${this.selectedProposal.id}`, 11);
    addText(`Data de Criação: ${this.formatDateTime(this.selectedProposal.created)}`, 11);
    addText(`Status: ${this.getStatusText(this.selectedProposal.status)}`, 11);
    addText(`Status de Pagamento: ${this.getPaymentStatus(this.selectedProposal)}`, 11);
    addSpace(20);

    // Assinatura digital
    addText('E, por estarem justas e contratadas, as partes assinam o presente instrumento.', 11, false, true);
    addSpace(15);

    addText(`${currentDate}`, 11, false, true);
    addSpace(30);

    // Campo de assinatura baseado no user_role
    if (this.selectedProposal.user_role === 'investor') {
      // Usuário é investidor - mostra campo para assinar como investidor
      addText('ASSINATURA DIGITAL DO INVESTIDOR:', 12, true);
      addSpace(10);
      
      // Informações da assinatura digital
      if (this.pdfFormData.acceptSignature && this.canSignDocument()) {
        addText('DOCUMENTO ASSINADO DIGITALMENTE', 11, true, true);
        addSpace(5);
        addText(`Nome: ${this.pdfFormData.signerName.toUpperCase()}`, 11);
        addText(`${this.pdfFormData.documentType.toUpperCase()}: ${this.pdfFormData.documentNumber}`, 11);
        addText(`Email: ${this.pdfFormData.signerEmail}`, 11);
        addText(`Data/Hora da Assinatura: ${this.formatDateTime(this.signatureSecurityInfo.timestamp)}`, 11);
        addText(`Timezone: ${this.signatureSecurityInfo.timezone}`, 11);
        addSpace(5);
        
        // Hash de validação
        addText(`Hash de Validação: ${this.generateContractHash()}`, 10);
        addText(`Plataforma: ${this.signatureSecurityInfo.platform}`, 10);
        addText(`Resolução da Tela: ${this.signatureSecurityInfo.screenResolution}`, 10);
        addSpace(10);
      } else {
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;
        addText(`${this.selectedProposal.investor_name.toUpperCase()} ${this.selectedProposal.investor_last_name.toUpperCase()}`, 11, true, true);
        addText('INVESTIDOR', 10, false, true);
        addSpace(10);
      }

      // Mostra informação do idealizador (sem campo de assinatura)
      addText('INFORMAÇÕES DO IDEALIZADOR:', 12, true);
      addSpace(5);
      addText(`Nome: ${this.selectedProposal.sponsored_name.toUpperCase()} ${this.selectedProposal.sponsored_last_name.toUpperCase()}`, 11);
      addText(`Email: ${this.selectedProposal.sponsored_email}`, 11);
      addText(`ID: ${this.selectedProposal.sponsored_id}`, 11);
      addText('Papel: IDEALIZADOR', 11);
      addSpace(15);
      
    } else {
      // Usuário é sponsored (idealizador) - mostra campo para assinar como idealizador
      addText('ASSINATURA DIGITAL DO IDEALIZADOR:', 12, true);
      addSpace(10);
      
      // Informações da assinatura digital
      if (this.pdfFormData.acceptSignature && this.canSignDocument()) {
        addText('DOCUMENTO ASSINADO DIGITALMENTE', 11, true, true);
        addSpace(5);
        addText(`Nome: ${this.pdfFormData.signerName.toUpperCase()}`, 11);
        addText(`${this.pdfFormData.documentType.toUpperCase()}: ${this.pdfFormData.documentNumber}`, 11);
        addText(`Email: ${this.pdfFormData.signerEmail}`, 11);
        addText(`Data/Hora da Assinatura: ${this.formatDateTime(this.signatureSecurityInfo.timestamp)}`, 11);
        addText(`Timezone: ${this.signatureSecurityInfo.timezone}`, 11);
        addSpace(5);
        
        // Hash de validação
        addText(`Hash de Validação: ${this.generateContractHash()}`, 10);
        addText(`Plataforma: ${this.signatureSecurityInfo.platform}`, 10);
        addText(`Resolução da Tela: ${this.signatureSecurityInfo.screenResolution}`, 10);
        addSpace(10);
      } else {
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;
        addText(`${this.selectedProposal.sponsored_name.toUpperCase()} ${this.selectedProposal.sponsored_last_name.toUpperCase()}`, 11, true, true);
        addText('IDEALIZADOR', 10, false, true);
        addSpace(10);
      }

      // Mostra informação do investidor (sem campo de assinatura) 
      addText('INFORMAÇÕES DO INVESTIDOR:', 12, true);
      addSpace(5);
      addText(`Nome: ${this.selectedProposal.investor_name.toUpperCase()} ${this.selectedProposal.investor_last_name.toUpperCase()}`, 11);
      addText(`Email: ${this.selectedProposal.investor_email}`, 11);
      addText(`ID: ${this.selectedProposal.investor_id}`, 11);
      addText('Papel: INVESTIDOR', 11);
      addSpace(15);
    }

    // Rodapé legal
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(128, 128, 128);
    const disclaimer = 'Este documento foi gerado automaticamente pela plataforma e não possui validade jurídica oficial. Para fins legais, consulte um advogado.';
    const disclaimerLines = pdf.splitTextToSize(disclaimer, pageWidth - 2 * margin);
    pdf.text(disclaimerLines, pageWidth / 2, pageHeight - 20, { align: 'center' });
    
    pdf.text(`Gerado em: ${this.formatDateTime(new Date().toISOString())}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    return pdf.output('blob');
  }

  private numberToWords(num: number): string {
    const units = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
    const tens = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
    const teens = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
    
    if (num === 0) return 'zero';
    if (num === 100) return 'cem';
    
    let result = '';
    
    if (num >= 100) {
      const hundreds = Math.floor(num / 100);
      result += (hundreds === 1 ? 'cento' : units[hundreds] + 'centos') + ' ';
      num %= 100;
      if (num > 0) result += 'e ';
    }
    
    if (num >= 20) {
      result += tens[Math.floor(num / 10)];
      num %= 10;
      if (num > 0) result += ' e ' + units[num];
    } else if (num >= 10) {
      result += teens[num - 10];
    } else if (num > 0) {
      result += units[num];
    }
    
    return result.trim();
  }
  

  captureSecurityInfo(): void {
    const now = new Date();
    this.signatureSecurityInfo = {
      timestamp: now.toISOString(),
      userAgent: navigator.userAgent,
      ipAddress: 'Será capturado pelo backend',
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  formatDocumentNumber(event?: any): void {
    if (!this.pdfFormData.documentNumber) return;
    let numbers = this.pdfFormData.documentNumber.replace(/\D/g, '');
    let formattedValue = '';
    
    if (this.pdfFormData.documentType === 'cpf') {
      if (numbers.length > 11) {
        numbers = numbers.substring(0, 11);
      }
      
      for (let i = 0; i < numbers.length; i++) {
        if (i === 3 || i === 6) {
          formattedValue += '.';
        } else if (i === 9) {
          formattedValue += '-';
        }
        formattedValue += numbers[i];
      }
    } else {
      if (numbers.length > 14) {
        numbers = numbers.substring(0, 14);
      }
      
      for (let i = 0; i < numbers.length; i++) {
        if (i === 2 || i === 5) {
          formattedValue += '.';
        } else if (i === 8) {
          formattedValue += '/';
        } else if (i === 12) {
          formattedValue += '-';
        }
        formattedValue += numbers[i];
      }
    }
    
    this.pdfFormData.documentNumber = formattedValue;
  }

  validateDocument(): boolean {
    if (!this.pdfFormData.documentNumber) return false;
    
    const numbers = this.pdfFormData.documentNumber.replace(/\D/g, '');
    
    if (this.pdfFormData.documentType === 'cpf') {
      return this.validateCPF(numbers);
    } else {
      return this.validateCNPJ(numbers);
    }
  }

  private validateCPF(cpf: string): boolean {
    if (cpf.length !== 11) return false;
    
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    let sum = 0;
    let remainder;
    
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;
    
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
  }

  private validateCNPJ(cnpj: string): boolean {
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cnpj)) return false;
    let length = cnpj.length - 2;
    let numbers = cnpj.substring(0, length);
    const digits = cnpj.substring(length);
    let sum = 0;
    let pos = length - 7;
    
    for (let i = length; i >= 1; i--) {
      sum += parseInt(numbers.charAt(length - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    
    let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    if (result !== parseInt(digits.charAt(0))) return false;
    
    length = length + 1;
    numbers = cnpj.substring(0, length);
    sum = 0;
    pos = length - 7;
    
    for (let i = length; i >= 1; i--) {
      sum += parseInt(numbers.charAt(length - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    
    result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    if (result !== parseInt(digits.charAt(1))) return false;
    
    return true;
  }

  canSignDocument(): boolean {
    if (this.selectedProposal?.user_role === 'investor' && !this.selectedProposal?.paid) {
      return false;
    }
    
    return this.pdfFormData.acceptSignature && 
           this.pdfFormData.signerName.trim() !== '' &&
           this.pdfFormData.signerEmail.trim() !== '' &&
           this.pdfFormData.documentNumber.trim() !== '' &&
           this.validateDocument();
  }

  requiresPaymentBeforeSignature(): boolean {
    return this.selectedProposal?.user_role === 'investor' && !this.selectedProposal?.paid;
  }

  private generateContractHash(): string {
    const content = JSON.stringify({
      proposalId: this.selectedProposal?.id,
      title: this.pdfFormData.title,
      content: this.pdfFormData.description,
      timestamp: this.signatureSecurityInfo.timestamp
    });
    
    return btoa(content).slice(0, 32);
  }

  getSignatureData() {
    return {
      documentType: this.pdfFormData.documentType,
      documentNumber: this.pdfFormData.documentNumber,
      signerName: this.pdfFormData.signerName,
      signerEmail: this.pdfFormData.signerEmail,
      securityInfo: this.signatureSecurityInfo,
      proposalId: this.selectedProposal?.id,
      contractHash: this.generateContractHash(),
      signedAt: new Date().toISOString()
    };
  }

  prepareSignatureForBackend() {
    const signatureData = this.getSignatureData();
    const backendPayload = {
      proposalId: this.selectedProposal?.id,
      signatureInfo: {
        signerName: this.pdfFormData.signerName,
        signerEmail: this.pdfFormData.signerEmail,
        documentType: this.pdfFormData.documentType,
        documentNumber: this.pdfFormData.documentNumber.replace(/\D/g, ''),
        userRole: this.selectedProposal?.user_role,
        signedAt: signatureData.signedAt,
        contractHash: signatureData.contractHash
      },
      securityInfo: {
        timestamp: this.signatureSecurityInfo.timestamp,
        userAgent: this.signatureSecurityInfo.userAgent,
        platform: this.signatureSecurityInfo.platform,
        language: this.signatureSecurityInfo.language,
        screenResolution: this.signatureSecurityInfo.screenResolution,
        timezone: this.signatureSecurityInfo.timezone,
        ipAddress: null
      },
      contractDetails: {
        title: this.pdfFormData.title,
        subtitle: this.pdfFormData.subtitle,
        description: this.pdfFormData.description,
        investmentAmount: this.selectedProposal?.investimento_minimo,
        equityPercentage: this.selectedProposal?.porcentagem_cedida,
        innovationName: this.selectedProposal?.innovation_name
      }
    };
    
    return backendPayload;
  }

  async saveDigitalSignature() {
    try {
      const payload = this.prepareSignatureForBackend();
      console.log(payload);
      return { success: true, signatureId: Date.now() };
    } catch (error) {
      console.error('Erro ao salvar assinatura:', error);
      throw error;
    }
  }

  async checkContractSignatureStatus(proposalId: number): Promise<void> {
    this.signatureStatusLoading = true;
    this.signatureStatusError = '';
    
    try {
      const response = await this.authService.checkSignatureStatus(proposalId).toPromise();
      this.signatureStatus = response;
      
      
    } catch (error: any) {
      console.error(error);
      this.signatureStatusError = 'Erro ao verificar status da assinatura';
      
      if (error.status === 404) {
        this.signatureStatusError = 'Nenhuma assinatura encontrada para este contrato';
      } else if (error.status === 403) {
        this.signatureStatusError = 'Sem permissão para verificar status da assinatura';
      }
      
    } finally {
      this.signatureStatusLoading = false;
    }
  }

  getSignatureStatusText(): string {
    if (!this.signatureStatus) return 'Não assinado';
    
    switch (this.signatureStatus.status) {
      case 'signed': return 'Assinado';
      case 'pending': return 'Pendente';
      case 'expired': return 'Expirado';
      case 'rejected': return 'Rejeitado';
      default: return 'Status desconhecido';
    }
  }

  getSignatureStatusColor(): string {
    if (!this.signatureStatus) return 'text-gray-400';
    
    switch (this.signatureStatus.status) {
      case 'signed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'expired': return 'text-red-400';
      case 'rejected': return 'text-red-400';
      default: return 'text-gray-400';
    }
  }

  hasSignatureInfo(): boolean {
    return this.signatureStatus && this.signatureStatus.signatureInfo;
  }

  openPaymentModal(proposal: ProposalData): void {
    this.selectedPaymentProposal = proposal;
    this.paymentError = '';
    this.paymentSuccess = false;
    this.showPaymentModal = true;
    document.body.style.overflow = 'hidden';
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
    this.selectedPaymentProposal = null;
    this.paymentError = '';
    this.paymentSuccess = false;
    document.body.style.overflow = 'auto';
  }
reloadPage(): void {
    window.location.reload();
  }



async processPayment(): Promise<void> {
  if (!this.selectedPaymentProposal || this.paymentLoading) {
    return;
  }

  this.paymentLoading = true;
  this.paymentError = '';
  this.paymentSuccess = false;

  try {
    const response = await this.authService.paymentProposal(
      this.selectedPaymentProposal.innovation_id.toString(),
      this.selectedPaymentProposal.id.toString(), 
      this.selectedPaymentProposal.investimento_minimo.toString(),
      this.selectedPaymentProposal.sponsored_id
    ).toPromise();
    
    // Sempre verifica se contém "sucesso" na mensagem para determinar se é sucesso ou erro
    if (response && response.message && response.message.toLowerCase().includes('sucesso')) {
      this.paymentSuccess = true;
      
      // Atualiza o status da proposta localmente
      this.selectedPaymentProposal.paid = true;
      
      // Atualiza a lista de propostas
      const proposalIndex = this.proposals.findIndex(p => p.id === this.selectedPaymentProposal!.id);
      if (proposalIndex !== -1) {
        this.proposals[proposalIndex].paid = true;
      }
      
      // Reaplica os filtros
      this.applyFilters();
      
      // Aguarda 3 segundos para mostrar a mensagem de sucesso
      setTimeout(() => {
        this.closePaymentModal();
        
        // Recarrega a página após fechar o modal
        setTimeout(() => {
          this.reloadPage();
        }, 500);
      }, 3000);
      
      console.log('Pagamento processado com sucesso:', response);
    } else {
      // Se não contém "sucesso", mostra como erro
      this.paymentError = response?.message || 'Erro ao processar pagamento. Tente novamente.';
    }
    
  } catch (error: any) {
    console.error('Erro ao processar pagamento:', error);
    
    // Sempre mostra a mensagem da resposta, seja erro ou sucesso
    if (error.error && error.error.message) {
      // Verifica se a mensagem contém "sucesso"
      if (error.error.message.toLowerCase().includes('sucesso')) {
        this.paymentSuccess = true;
        
        // Atualiza o status da proposta localmente
        if (this.selectedPaymentProposal) {
          this.selectedPaymentProposal.paid = true;
          
          // Atualiza a lista de propostas
          const proposalIndex = this.proposals.findIndex(p => p.id === this.selectedPaymentProposal!.id);
          if (proposalIndex !== -1) {
            this.proposals[proposalIndex].paid = true;
          }
          
          // Reaplica os filtros
          this.applyFilters();
        }
        
        // Aguarda 3 segundos para mostrar a mensagem de sucesso
        setTimeout(() => {
          this.closePaymentModal();
          
          // Recarrega a página após fechar o modal
          setTimeout(() => {
            this.reloadPage();
          }, 500);
        }, 3000);
        
        console.log('Pagamento processado com sucesso (via catch):', error.error);
      } else {
        // Se não contém "sucesso", mostra como erro
        this.paymentError = error.error.message;
      }
    } else {
      // Fallback para erro genérico
      this.paymentError = 'Erro interno. Tente novamente mais tarde.';
    }
  } finally {
    this.paymentLoading = false;
  }
}




  processInvestmentPayment(proposal: ProposalData): void {
    this.openPaymentModal(proposal);
  }

 async checkExistingSignatures(proposalId: number): Promise<void> {
  this.signatureLoading = true;
  this.signatureError = '';
  
  try {
    const response = await this.authService.checkSignatureStatus(proposalId).toPromise();
    this.signatureData = response;
    console.log('Dados das assinaturas:', response);
  } catch (error: any) {
    console.error('Erro ao verificar assinaturas:', error);
    this.signatureError = 'Erro ao verificar assinaturas';
    this.signatureData = null;
  } finally {
    this.signatureLoading = false;
  }
}

  async openSignatureModal(proposal: ProposalData): Promise<void> {
  console.log('Abrindo modal de assinaturas para proposta:', proposal.id);
  this.selectedProposal = proposal;
  this.showSignatureModal = true;
  document.body.style.overflow = 'hidden';
  
  await this.checkExistingSignatures(proposal.id);
  console.log('Modal aberto, dados carregados:', this.signatureData);
}


  closeSignatureModal(): void {
    this.showSignatureModal = false;
    this.selectedProposal = null;
    this.signatureData = null;
    this.signatureError = '';
    document.body.style.overflow = 'auto';
  }

  downloadSignedPdf(pdfUrl: string, filename: string): void {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = filename || 'contrato-assinado.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

}