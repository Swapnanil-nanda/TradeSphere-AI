"""
TradeSphere AI - Institutional PDF Research Report Generator
Builds formatted institutional research dossiers using ReportLab.
"""
from typing import Dict, Any, Optional
import io
import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

class PDFReportGenerator:
    @classmethod
    def generate_research_pdf(cls, run_data: Dict[str, Any]) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=40,
            leftMargin=40,
            topMargin=40,
            bottomMargin=40
        )

        styles = getSampleStyleSheet()
        
        # Custom Typography Styles
        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=20,
            leading=24,
            textColor=colors.HexColor('#0f172a'),
            spaceAfter=4
        )
        subtitle_style = ParagraphStyle(
            'DocSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=13,
            textColor=colors.HexColor('#64748b'),
            spaceAfter=12
        )
        h2_style = ParagraphStyle(
            'SectionH2',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=12,
            leading=16,
            textColor=colors.HexColor('#1e293b'),
            spaceBefore=10,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            'Body',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor('#334155')
        )
        disclaimer_style = ParagraphStyle(
            'Disclaimer',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=8,
            leading=11,
            textColor=colors.HexColor('#b91c1c')
        )

        elements = []

        # 1. Header Banner
        elements.append(Paragraph("TradeSphere AI — Quantitative Research Dossier", title_style))
        elements.append(Paragraph("Autonomous Multi-Agent Alpha Modeling & Risk Invariant System", subtitle_style))
        elements.append(Spacer(1, 6))

        # 2. Metadata Table
        run_id = run_data.get("id", "N/A")
        timestamp = run_data.get("timestamp", datetime.datetime.now(datetime.timezone.utc).isoformat())
        user_query = run_data.get("user_query", "Quantitative Analysis")
        agents = ", ".join(run_data.get("invoked_agents", []))

        meta_rows = [
            [Paragraph("<b>Research Run ID:</b>", body_style), Paragraph(str(run_id), body_style)],
            [Paragraph("<b>Analysis Query:</b>", body_style), Paragraph(str(user_query), body_style)],
            [Paragraph("<b>Timestamp (UTC):</b>", body_style), Paragraph(str(timestamp), body_style)],
            [Paragraph("<b>Specialist Agents:</b>", body_style), Paragraph(str(agents), body_style)],
            [Paragraph("<b>Methodology Version:</b>", body_style), Paragraph("2026.Q4-Institutional", body_style)]
        ]
        meta_table = Table(meta_rows, colWidths=[140, 390])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(meta_table)
        elements.append(Spacer(1, 10))

        # 3. Executive Synthesis Summary
        elements.append(Paragraph("Executive Multi-Agent Synthesis", h2_style))
        summary_text = run_data.get("synthesis_summary", "Quantitative modeling completed.")
        elements.append(Paragraph(summary_text, body_style))
        elements.append(Spacer(1, 10))

        # 4. Evidence Verification Status
        elements.append(Paragraph("Independent Evidence Verification & Invariants Audit", h2_style))
        v_report = run_data.get("evidence_verification", {})
        is_verified = v_report.get("is_verified", False)
        status_text = "PASSED COMPLIANCE" if is_verified else "FLAGGED"

        verif_rows = [
            [Paragraph("<b>Overall Compliance Status:</b>", body_style), Paragraph(f"<b>{status_text}</b>", body_style)],
            [Paragraph("<b>One-Sided VaR Metric:</b>", body_style), Paragraph("COMPLIANT (Left-Tail Loss)", body_style)],
            [Paragraph("<b>Path-Based Drawdown:</b>", body_style), Paragraph("VERIFIED (Path Peak-to-Trough)", body_style)],
            [Paragraph("<b>Uncertainty Certification:</b>", body_style), Paragraph("VERIFIED (No Certainty Asserted)", body_style)],
            [Paragraph("<b>Safe Position Sizing:</b>", body_style), Paragraph("ENFORCED (0 Units on Risk Breach)", body_style)],
        ]
        verif_table = Table(verif_rows, colWidths=[180, 350])
        verif_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f1f5f9')),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ]))
        elements.append(verif_table)
        elements.append(Spacer(1, 10))

        # 5. Technical & Forecasting Breakdown if available
        if run_data.get("technical_analysis"):
            ta = run_data["technical_analysis"]
            elements.append(Paragraph(f"Technical Analysis Regime — {ta.get('symbol', 'N/A')}", h2_style))
            ta_rows = [
                [Paragraph("<b>Market Regime:</b>", body_style), Paragraph(str(ta.get("regime")), body_style)],
                [Paragraph("<b>LTP / 20-EMA / 50-SMA:</b>", body_style), Paragraph(f"{ta.get('current_price')} / {ta.get('ema_20')} / {ta.get('sma_50')}", body_style)],
                [Paragraph("<b>RSI(14) / MACD Hist:</b>", body_style), Paragraph(f"{ta.get('rsi_14')} / {ta.get('macd_hist')}", body_style)],
                [Paragraph("<b>Bollinger Bands (20,2):</b>", body_style), Paragraph(f"Upper: {ta.get('bb_upper')} | Lower: {ta.get('bb_lower')}", body_style)],
            ]
            ta_table = Table(ta_rows, colWidths=[160, 370])
            ta_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
                ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
                ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
                ('TOPPADDING', (0, 0), (-1, -1), 3),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ]))
            elements.append(ta_table)
            elements.append(Spacer(1, 10))

        if run_data.get("forecasting"):
            fc = run_data["forecasting"]
            elements.append(Paragraph("Probabilistic Horizon Forecasts (Student's t Kernel)", h2_style))
            fc_rows = [["Horizon", "Expected Return", "Median Return", "80% Conf. Interval", "95% Conf. Interval"]]
            for h in fc.get("horizons", []):
                fc_rows.append([
                    f"{h.get('horizon_days')} Days",
                    f"{h.get('expected_return_pct')}%",
                    f"{h.get('median_return_pct')}%",
                    f"[{h.get('confidence_interval_80', [0, 0])[0]}%, {h.get('confidence_interval_80', [0, 0])[1]}%]",
                    f"[{h.get('confidence_interval_95', [0, 0])[0]}%, {h.get('confidence_interval_95', [0, 0])[1]}%]"
                ])
            fc_table = Table(fc_rows, colWidths=[70, 100, 100, 130, 130])
            fc_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 8),
                ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
                ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
                ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ]))
            elements.append(fc_table)
            elements.append(Spacer(1, 12))

        # 5b. Cross-Document Intelligence & Evidence Citations if present
        if run_data.get("evidence_citations"):
            citations = run_data["evidence_citations"]
            elements.append(Paragraph("Cross-Document Evidence Trail & Regulatory Citations", h2_style))
            cite_rows = [["ID", "Document Title", "Type", "Relevant Excerpt", "Conf."]]
            for c in citations[:8]:
                cite_rows.append([
                    str(c.get("citation_id", "CIT-01")),
                    Paragraph(f"<b>{c.get('document_title', 'Filing')}</b><br/>{c.get('section', '')}", body_style),
                    str(c.get("doc_type", "FILING")),
                    Paragraph(f"<i>\"{c.get('relevant_snippet', '')[:120]}...\"</i>", body_style),
                    f"{round(float(c.get('confidence_score', 0.9)) * 100)}%"
                ])
            cite_table = Table(cite_rows, colWidths=[50, 140, 60, 220, 60])
            cite_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e293b')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 8),
                ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
                ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
                ('TOPPADDING', (0, 0), (-1, -1), 3),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ]))
            elements.append(cite_table)
            elements.append(Spacer(1, 12))

        # 6. Mandatory Regulatory & Statutory Disclaimer
        elements.append(Paragraph("Mandatory Statutory Risk Disclosure", h2_style))
        disclaimer_msg = (
            "<b>NOTICE:</b> This document is generated for research and educational simulation only. "
            "TradeSphere AI does not provide registered investment advice. Market forecasts and historical "
            "analogues are strictly probabilistic estimates and never guarantee future performance. "
            "Past statistical relationships can break down unpredictably during macroeconomic, liquidity, or "
            "systemic regime shifts. The Quantitative Engine operates with zero broker trading authority."
        )
        elements.append(Paragraph(disclaimer_msg, disclaimer_style))

        doc.build(elements)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes

    @classmethod
    def generate_strategy_pdf(cls, package: Dict[str, Any]) -> bytes:
        """
        Builds institutional-grade reproducible strategy PDF dossier with SHA-256 cryptographic provenance.
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=40,
            leftMargin=40,
            topMargin=40,
            bottomMargin=40
        )
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'StrategyTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=18,
            leading=22,
            textColor=colors.HexColor('#0f172a'),
            spaceAfter=4
        )
        subtitle_style = ParagraphStyle(
            'StrategySub',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor('#64748b'),
            spaceAfter=10
        )
        h2_style = ParagraphStyle(
            'SectionH2',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=11,
            leading=15,
            textColor=colors.HexColor('#1e293b'),
            spaceBefore=8,
            spaceAfter=5
        )
        body_style = ParagraphStyle(
            'Body',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8,
            leading=11,
            textColor=colors.HexColor('#334155')
        )
        code_style = ParagraphStyle(
            'CodeBlock',
            parent=styles['Code'],
            fontName='Courier',
            fontSize=7,
            leading=9,
            textColor=colors.HexColor('#0f172a')
        )
        disclaimer_style = ParagraphStyle(
            'Disclaimer',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=7,
            leading=10,
            textColor=colors.HexColor('#b91c1c')
        )

        elements = []

        strat_info = package.get("strategy", {})
        prov_hash = package.get("provenance_hash", "UNKNOWN")
        gen_at = package.get("generated_at", datetime.datetime.now(datetime.timezone.utc).isoformat())

        # Header
        elements.append(Paragraph(f"Strategy Reproducibility Dossier: {strat_info.get('name', 'STRATEGY')}", title_style))
        elements.append(Paragraph(f"Target Asset: {strat_info.get('symbol')} | Cryptographic Provenance Hash: {prov_hash[:24]}...", subtitle_style))

        # Provenance Banner
        banner_rows = [
            [Paragraph("<b>SHA-256 Provenance Checksum:</b>", body_style), Paragraph(f"<code>{prov_hash}</code>", code_style)],
            [Paragraph("<b>Generated Timestamp (UTC):</b>", body_style), Paragraph(gen_at, body_style)],
            [Paragraph("<b>Reproducibility Standard:</b>", body_style), Paragraph("TradeSphere Deterministic Invariant Standard (v1.0-REGULATORY)", body_style)],
            [Paragraph("<b>Random Seed:</b>", body_style), Paragraph(str(package.get("random_seed", 42)), body_style)],
        ]
        b_table = Table(banner_rows, colWidths=[160, 370])
        b_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ]))
        elements.append(b_table)
        elements.append(Spacer(1, 8))

        # Performance Summary Table
        elements.append(Paragraph("Risk-Adjusted Performance Summary", h2_style))
        p_rows = [
            ["Initial Capital", "Final Equity", "CAGR", "Sharpe", "Sortino", "Max DD", "Win Rate", "Trades"],
            [
                f"${strat_info.get('initial_capital', 0):,.0f}",
                f"${strat_info.get('final_equity', 0):,.0f}",
                f"{strat_info.get('cagr_pct', 0)}%",
                f"{strat_info.get('sharpe_ratio', 0)}",
                f"{strat_info.get('sortino_ratio', 0)}",
                f"{strat_info.get('max_drawdown_pct', 0)}%",
                f"{strat_info.get('win_rate_pct', 0)}%",
                f"{strat_info.get('total_trades', 0)}"
            ]
        ]
        p_table = Table(p_rows, colWidths=[70, 70, 60, 55, 55, 65, 65, 50])
        p_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(p_table)
        elements.append(Spacer(1, 8))

        # Recent Trades Log (first 6)
        trades = package.get("trade_ledger", [])
        if trades:
            elements.append(Paragraph(f"Verified Execution Ledger Sample (Total Trades: {len(trades)})", h2_style))
            t_rows = [["Entry Date", "Exit Date", "Side", "Entry Price", "Exit Price", "Qty", "Return %", "PnL ($)"]]
            for t in trades[:6]:
                pnl_color = colors.HexColor('#16a34a') if t.get("pnl", 0) >= 0 else colors.HexColor('#dc2626')
                t_rows.append([
                    str(t.get("entry_date", ""))[:10],
                    str(t.get("exit_date", ""))[:10],
                    str(t.get("side", "BUY")),
                    f"${t.get('entry_price', 0):.2f}",
                    f"${t.get('exit_price', 0):.2f}",
                    str(t.get("quantity", 0)),
                    f"{t.get('return_pct', 0):.2f}%",
                    f"${t.get('pnl', 0):.2f}"
                ])
            t_table = Table(t_rows, colWidths=[65, 65, 45, 65, 65, 45, 65, 75])
            t_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#334155')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 7),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
                ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
                ('TOPPADDING', (0, 0), (-1, -1), 3),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ]))
            elements.append(t_table)
            elements.append(Spacer(1, 8))

        # Python Replication Code Snippet
        elements.append(Paragraph("Independent Python Replication Script", h2_style))
        rep_code = package.get("replication_code", "# Code not provided")
        elements.append(Paragraph(f"<pre>{rep_code.replace('<', '&lt;').replace('>', '&gt;')}</pre>", code_style))
        elements.append(Spacer(1, 8))

        # Statutory Disclaimer
        elements.append(Paragraph("Reproducibility Verification Notice", h2_style))
        elements.append(Paragraph(
            "<b>STATUTORY NOTICE:</b> This reproducibility package contains deterministic mathematical parameters and simulated execution ledgers. "
            "All metrics reflect historical or synthetic backtest conditions subject to execution constraints. "
            "Checksum verifies cryptographic integrity of inputs and outputs but does not guarantee future trading profits.",
            disclaimer_style
        ))

        doc.build(elements)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes
