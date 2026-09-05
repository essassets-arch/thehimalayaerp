'use client';

import React from 'react';
import styles from './hr-sops.module.css';

export default function HRPhysicalBlankView({ form }) {
  if (!form) return null;

  return (
    <div className={styles.physicalPaper}>
      {/* ── Document Control Header Box ── */}
      <div className={styles.physicalHeaderBox}>
        <div style={{ textAlign: 'center', padding: '8px', borderBottom: '1px solid #000' }}>
          <div style={{ fontSize: '15px', fontWeight: '900', letterSpacing: '0.04em' }}>
            HIMALAYA COMPOSITE AND PRECAST PVT. LTD.
          </div>
          <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
            HUMAN RESOURCES FORMS & FORMATS
          </div>
          <div style={{ fontSize: '11px' }}>
            Document No.: HR-FORM-001 | Revision No.: {form.revision || '00'}
          </div>
        </div>

        <div className={styles.physicalHeaderGrid}>
          <div className={styles.physicalHeaderCell}>Company: Himalaya Composite and Precast Pvt. Ltd.</div>
          <div className={styles.physicalHeaderCell}>Form No: {form.formNo}</div>
          <div className={styles.physicalHeaderCell}>Revision: {form.revision || '00'}</div>
          <div className={styles.physicalHeaderCell}>Date: ___ / ___ / _____</div>
        </div>

        <div style={{ textAlign: 'center', fontSize: '10px', fontWeight: 'bold', padding: '3px', background: '#fafafa', color: '#b91c1c' }}>
          CONTROLLED DOCUMENT -- UNCONTROLLED WHEN PRINTED
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '900', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {form.formNo} -- {form.title}
        </h2>
      </div>

      {/* ── Form Specific Physical Layout ── */}
      {renderPhysicalBody(form)}

      {/* ── Standard 3-Level Physical Signoff Block ── */}
      <div className={styles.physicalSignoffGrid}>
        <div className={styles.physicalSignoffCol}>
          <div style={{ fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '3px', textTransform: 'uppercase', fontSize: '11px' }}>
            Prepared / Submitted By
          </div>
          <div>Name: _____________________</div>
          <div style={{ marginTop: '10px' }}>Signature: ________________</div>
          <div style={{ marginTop: '10px' }}>Date: ___ / ___ / _____</div>
        </div>

        <div className={styles.physicalSignoffCol}>
          <div style={{ fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '3px', textTransform: 'uppercase', fontSize: '11px' }}>
            Verified / Reviewed By
          </div>
          <div>Name: _____________________</div>
          <div style={{ marginTop: '10px' }}>Signature: ________________</div>
          <div style={{ marginTop: '10px' }}>Date: ___ / ___ / _____</div>
        </div>

        <div className={styles.physicalSignoffCol}>
          <div style={{ fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '3px', textTransform: 'uppercase', fontSize: '11px' }}>
            Approved By
          </div>
          <div>Name: _____________________</div>
          <div style={{ marginTop: '10px' }}>Signature: ________________</div>
          <div style={{ marginTop: '10px' }}>Date: ___ / ___ / _____</div>
        </div>
      </div>
    </div>
  );
}

function renderPhysicalBody(form) {
  switch (form.formNo) {
    // ── HR-F-01: MANPOWER REQUISITION FORM ──
    case 'HR-F-01':
      return (
        <div>
          <div className={styles.physicalGrid2Col}>
            <div className={styles.physicalCell}>
              <strong>Department:</strong> <span className={styles.physicalLine}></span>
            </div>
            <div className={styles.physicalCell}>
              <strong>Position / Designation:</strong> <span className={styles.physicalLine}></span>
            </div>
            <div className={styles.physicalCell}>
              <strong>No. of Positions:</strong> <span className={styles.physicalLine}></span>
            </div>
            <div className={styles.physicalCell}>
              <strong>New / Replacement:</strong> &nbsp;☐ New &nbsp;&nbsp; ☐ Replacement
            </div>
            <div className={styles.physicalCell}>
              <strong>Reason for Requirement:</strong> <span className={styles.physicalLine}></span>
            </div>
            <div className={styles.physicalCell}>
              <strong>Required Joining Date:</strong> &nbsp;___ / ___ / _____
            </div>
            <div className={styles.physicalCell}>
              <strong>Reporting To:</strong> <span className={styles.physicalLine}></span>
            </div>
            <div className={styles.physicalCell}>
              <strong>Employment Type:</strong> &nbsp;☐ Permanent &nbsp; ☐ Contract &nbsp; ☐ Temporary
            </div>
            <div className={styles.physicalCell}>
              <strong>Required Qualification:</strong> <span className={styles.physicalLine}></span>
            </div>
            <div className={styles.physicalCell}>
              <strong>Required Experience:</strong> <span className={styles.physicalLine}></span>
            </div>
            <div className={styles.physicalCell}>
              <strong>Key Skills / Competencies:</strong> <span className={styles.physicalLine}></span>
            </div>
            <div className={styles.physicalCell}>
              <strong>Proposed Salary / CTC:</strong> <span className={styles.physicalLine}></span>
            </div>
            <div className={styles.physicalCell}>
              <strong>Budget Available:</strong> &nbsp;☐ Yes &nbsp;&nbsp; ☐ No
            </div>
            <div className={styles.physicalCell}>
              <strong>Priority:</strong> &nbsp;☐ Normal &nbsp;&nbsp; ☐ Urgent
            </div>
            <div className={styles.physicalCell}>
              <strong>Job Description Attached:</strong> &nbsp;☐ Yes &nbsp;&nbsp; ☐ No
            </div>
            <div className={styles.physicalCell}>
              <strong>Requested By:</strong> <span className={styles.physicalLine}></span>
            </div>
          </div>

          <div style={{ marginTop: '12px', marginBottom: '16px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '6px' }}>
              Justification / Additional Requirement:
            </div>
            <div style={{ borderBottom: '1px solid #000', minHeight: '24px', marginBottom: '8px' }}></div>
            <div style={{ borderBottom: '1px solid #000', minHeight: '24px', marginBottom: '8px' }}></div>
            <div style={{ borderBottom: '1px solid #000', minHeight: '24px' }}></div>
          </div>
        </div>
      );

    // ── HR-F-02: EMPLOYEE JOINING CHECKLIST ──
    case 'HR-F-02': {
      const items = form.items || [];
      return (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px', fontSize: '12px', fontWeight: 'bold' }}>
            <div>Employee Name: _____________________</div>
            <div>Employee ID: _____________________</div>
            <div>Date of Joining: ___ / ___ / _____</div>
          </div>

          <table className={styles.physicalTable}>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>Sl</th>
                <th>Item</th>
                <th style={{ width: '130px' }}>Required</th>
                <th style={{ width: '160px', textAlign: 'center' }}>Submitted / Verified</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={it.id || idx}>
                  <td>{idx + 1}</td>
                  <td>{it.item}</td>
                  <td>{it.required}</td>
                  <td style={{ textAlign: 'center' }}>☐ Verified</td>
                  <td>_____________________</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '12px', marginBottom: '14px', fontSize: '12px', border: '1px solid #000', padding: '8px 12px' }}>
            <strong>Employee Declaration:</strong> I confirm that the information/documents submitted by me are true to the best of my knowledge.
            <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Employee Signature: _____________________</span>
              <span>Date: ___ / ___ / _____</span>
            </div>
          </div>
        </div>
      );
    }

    // ── HR-F-03: EMPLOYEE INDUCTION CHECKLIST ──
    case 'HR-F-03': {
      const topics = form.topics || [];
      return (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px', fontSize: '12px', fontWeight: 'bold' }}>
            <div>Employee Name: _____________________</div>
            <div>Employee ID: _____________________</div>
            <div>Department: _____________________</div>
          </div>

          <table className={styles.physicalTable}>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>Sl</th>
                <th>Topic</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Completed</th>
                <th style={{ width: '200px' }}>Trainer / Responsible</th>
                <th>Date / Remarks</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((t, idx) => (
                <tr key={t.id || idx}>
                  <td>{idx + 1}</td>
                  <td>{t.topic}</td>
                  <td style={{ textAlign: 'center' }}>☐</td>
                  <td>_____________________</td>
                  <td>_____________________</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '12px', marginBottom: '14px', fontSize: '12px', border: '1px solid #000', padding: '8px 12px' }}>
            <strong>Employee Acknowledgement:</strong> I have received and understood the induction topics relevant to my role.
            <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Employee Signature: _____________________</span>
              <span>Date: ___ / ___ / _____</span>
            </div>
          </div>
        </div>
      );
    }

    // ── HR-F-04: PROBATION / CONFIRMATION EVALUATION ──
    case 'HR-F-04': {
      const criteria = form.criteria || [];
      return (
        <div>
          <div className={styles.physicalGrid2Col}>
            <div className={styles.physicalCell}>
              <strong>Employee Name:</strong> <span className={styles.physicalLine}></span>
            </div>
            <div className={styles.physicalCell}>
              <strong>Employee ID:</strong> <span className={styles.physicalLine}></span>
            </div>
            <div className={styles.physicalCell}>
              <strong>Department:</strong> <span className={styles.physicalLine}></span>
            </div>
            <div className={styles.physicalCell}>
              <strong>Designation:</strong> <span className={styles.physicalLine}></span>
            </div>
            <div className={styles.physicalCell}>
              <strong>Date of Joining:</strong> &nbsp;___ / ___ / _____
            </div>
            <div className={styles.physicalCell}>
              <strong>Probation End Date:</strong> &nbsp;___ / ___ / _____
            </div>
            <div className={styles.physicalCell}>
              <strong>Reporting Manager:</strong> <span className={styles.physicalLine}></span>
            </div>
            <div className={styles.physicalCell}>
              <strong>Evaluation Date:</strong> &nbsp;___ / ___ / _____
            </div>
          </div>

          <table className={styles.physicalTable}>
            <thead>
              <tr>
                <th>Evaluation Criteria</th>
                <th style={{ width: '130px', textAlign: 'center' }}>Rating (1-5)</th>
                <th>Comments / Evidence</th>
              </tr>
            </thead>
            <tbody>
              {criteria.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.criteria}</strong></td>
                  <td style={{ textAlign: 'center' }}>[ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ]</td>
                  <td>__________________________________________________</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ margin: '12px 0', fontSize: '12px' }}>
            <strong>Recommendation:</strong> &nbsp;☐ Confirm &nbsp;&nbsp;&nbsp; ☐ Extend Probation &nbsp;&nbsp;&nbsp; ☐ Other action as per policy
          </div>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '6px' }}>Reason / Development Requirements:</div>
            <div style={{ borderBottom: '1px solid #000', minHeight: '24px', marginBottom: '6px' }}></div>
            <div style={{ borderBottom: '1px solid #000', minHeight: '24px' }}></div>
          </div>
        </div>
      );
    }

    // ── HR-F-05: ATTENDANCE REGISTER ──
    case 'HR-F-05':
      return (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '12px', fontWeight: 'bold' }}>
            <div>Month: _______________</div>
            <div>Year: _________</div>
            <div>Department: _______________</div>
          </div>

          <table className={styles.physicalTable}>
            <thead>
              <tr>
                <th style={{ width: '70px' }}>Date</th>
                <th style={{ width: '80px' }}>Employee ID</th>
                <th>Employee Name</th>
                <th style={{ width: '70px' }}>Dept.</th>
                <th style={{ width: '50px' }}>Shift</th>
                <th style={{ width: '55px' }}>In</th>
                <th style={{ width: '55px' }}>Out</th>
                <th style={{ width: '80px' }}>Status</th>
                <th style={{ width: '55px' }}>OT Hrs</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(12)].map((_, i) => (
                <tr key={i} style={{ height: '26px' }}>
                  <td>__/__/____</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ fontSize: '10.5px', color: '#475569', marginBottom: '12px' }}>
            Status examples: Present / Absent / Weekly Off / Holiday / Leave / Half Day / Late / Unauthorized Absence.
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px' }}>
            <div>Prepared By: _______________</div>
            <div>Verified By: _______________</div>
            <div>Date: _______________</div>
          </div>
        </div>
      );

    // ── HR-F-06: OVERTIME APPROVAL FORM ──
    case 'HR-F-06':
      return (
        <div>
          <div className={styles.physicalGrid2Col}>
            <div className={styles.physicalCell}>
              <strong>Employee Name:</strong> <span className={styles.physicalLine}></span>
            </div>
            <div className={styles.physicalCell}>
              <strong>Employee ID:</strong> <span className={styles.physicalLine}></span>
            </div>
            <div className={styles.physicalCell}>
              <strong>Department:</strong> <span className={styles.physicalLine}></span>
            </div>
            <div className={styles.physicalCell}>
              <strong>Date:</strong> &nbsp;___ / ___ / _____
            </div>
            <div className={styles.physicalCell}>
              <strong>Shift:</strong> <span className={styles.physicalLine}></span>
            </div>
            <div className={styles.physicalCell}>
              <strong>OT Start / End:</strong> <span className={styles.physicalLine}></span>
            </div>
            <div className={styles.physicalCell}>
              <strong>Total OT Hours:</strong> <span className={styles.physicalLine}></span>
            </div>
            <div className={styles.physicalCell}>
              <strong>Work / Reason:</strong> <span className={styles.physicalLine}></span>
            </div>
            <div className={styles.physicalCell}>
              <strong>Normal / Holiday OT:</strong> &nbsp;☐ Normal OT &nbsp;&nbsp; ☐ Holiday OT
            </div>
            <div className={styles.physicalCell}>
              <strong>Cost / Rate (if applicable):</strong> <span className={styles.physicalLine}></span>
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '6px' }}>Reason / Work Details:</div>
            <div style={{ borderBottom: '1px solid #000', minHeight: '24px', marginBottom: '6px' }}></div>
            <div style={{ borderBottom: '1px solid #000', minHeight: '24px' }}></div>
          </div>

          <div style={{ display: 'flex', gap: '24px', fontSize: '12px', marginBottom: '16px' }}>
            <div><strong>Prior approval:</strong> &nbsp;☐ Yes &nbsp;&nbsp; ☐ No</div>
            <div><strong>Emergency:</strong> &nbsp;☐ Yes &nbsp;&nbsp; ☐ No</div>
          </div>
        </div>
      );

    // ── HR-F-07: TRAINING ATTENDANCE REGISTER ──
    case 'HR-F-07':
      return (
        <div>
          <div style={{ border: '1px solid #000', padding: '8px 12px', marginBottom: '12px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div><strong>Training Title:</strong> _____________________</div>
              <div><strong>Trainer:</strong> _____________________</div>
              <div><strong>Date:</strong> ___ / ___ / _____</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div><strong>Department / Location:</strong> _____________________</div>
              <div><strong>Training Type:</strong> _____________________</div>
              <div><strong>Duration:</strong> _____________________</div>
            </div>
          </div>

          <table className={styles.physicalTable}>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>Sl.</th>
                <th style={{ width: '100px' }}>Employee ID</th>
                <th>Employee Name</th>
                <th style={{ width: '140px' }}>Department</th>
                <th style={{ width: '130px' }}>Signature</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(10)].map((_, i) => (
                <tr key={i} style={{ height: '26px' }}>
                  <td>{i + 1}</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>Training Objective / Key Topics:</div>
            <div style={{ borderBottom: '1px solid #000', minHeight: '24px' }}></div>
          </div>
        </div>
      );

    // ── HR-F-08: TRAINING EVALUATION FORM ──
    case 'HR-F-08': {
      const questions = form.questions || [];
      return (
        <div>
          <div className={styles.physicalGrid2Col}>
            <div className={styles.physicalCell}>
              <strong>Training Title:</strong> <span className={styles.physicalLine}></span>
            </div>
            <div className={styles.physicalCell}>
              <strong>Date:</strong> &nbsp;___ / ___ / _____
            </div>
            <div className={styles.physicalCell}>
              <strong>Employee Name:</strong> <span className={styles.physicalLine}></span>
            </div>
            <div className={styles.physicalCell}>
              <strong>Department:</strong> <span className={styles.physicalLine}></span>
            </div>
            <div className={styles.physicalCell}>
              <strong>Trainer:</strong> <span className={styles.physicalLine}></span>
            </div>
            <div className={styles.physicalCell}>
              <strong>Duration:</strong> <span className={styles.physicalLine}></span>
            </div>
          </div>

          <table className={styles.physicalTable}>
            <thead>
              <tr>
                <th>Evaluation Question</th>
                <th style={{ width: '130px', textAlign: 'center' }}>Rating (1-5)</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id}>
                  <td><strong>{q.question}</strong></td>
                  <td style={{ textAlign: 'center' }}>[ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ]</td>
                  <td>__________________________________________________</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ margin: '12px 0', fontSize: '12px' }}>
            <strong>Overall effectiveness:</strong> &nbsp;☐ Excellent &nbsp;&nbsp;&nbsp; ☐ Good &nbsp;&nbsp;&nbsp; ☐ Satisfactory &nbsp;&nbsp;&nbsp; ☐ Needs Improvement
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>Recommended follow-up / competency assessment:</div>
            <div style={{ borderBottom: '1px solid #000', minHeight: '24px' }}></div>
          </div>
        </div>
      );
    }

    // ── HR-F-09: ANNUAL TRAINING MATRIX ──
    case 'HR-F-09':
      return (
        <div>
          <table className={styles.physicalTable}>
            <thead>
              <tr>
                <th>Employee / Role</th>
                <th>Required Training</th>
                <th style={{ width: '90px' }}>Frequency</th>
                <th style={{ width: '100px' }}>Planned Date</th>
                <th style={{ width: '100px' }}>Completed Date</th>
                <th style={{ width: '90px' }}>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(8)].map((_, i) => (
                <tr key={i} style={{ height: '26px' }}>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td>___/___/____</td>
                  <td>___/___/____</td>
                  <td></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ fontSize: '11px', color: '#475569', marginBottom: '12px' }}>
            Review frequency: Monthly / Quarterly as defined by management.
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px' }}>
            <div>Prepared By: _______________</div>
            <div>Reviewed By: _______________</div>
            <div>Date: _______________</div>
          </div>
        </div>
      );

    // ── HR-F-10: PERFORMANCE APPRAISAL -- KRA / KPI ──
    case 'HR-F-10':
      return (
        <div>
          <div className={styles.physicalGrid2Col}>
            <div className={styles.physicalCell}>
              <strong>Employee Name:</strong> <span className={styles.physicalLine}></span>
            </div>
            <div className={styles.physicalCell}>
              <strong>Employee ID:</strong> <span className={styles.physicalLine}></span>
            </div>
            <div className={styles.physicalCell}>
              <strong>Department:</strong> <span className={styles.physicalLine}></span>
            </div>
            <div className={styles.physicalCell}>
              <strong>Designation:</strong> <span className={styles.physicalLine}></span>
            </div>
            <div className={styles.physicalCell}>
              <strong>Appraisal Period:</strong> <span className={styles.physicalLine}></span>
            </div>
            <div className={styles.physicalCell}>
              <strong>Reporting Manager:</strong> <span className={styles.physicalLine}></span>
            </div>
          </div>

          <table className={styles.physicalTable}>
            <thead>
              <tr>
                <th>KRA / KPI</th>
                <th style={{ width: '80px' }}>Weight %</th>
                <th>Target</th>
                <th>Achievement</th>
                <th style={{ width: '80px' }}>Rating</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} style={{ height: '26px' }}>
                  <td>{i + 1}. </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ margin: '10px 0', fontSize: '12px' }}>
            <strong>Overall Rating:</strong> &nbsp;☐ Outstanding &nbsp;&nbsp; ☐ Exceeds Expectations &nbsp;&nbsp; ☐ Meets Expectations &nbsp;&nbsp; ☐ Needs Improvement &nbsp;&nbsp; ☐ Unsatisfactory
          </div>

          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>Development / Training Needs:</div>
            <div style={{ borderBottom: '1px solid #000', minHeight: '24px' }}></div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>Employee Comments:</div>
            <div style={{ borderBottom: '1px solid #000', minHeight: '24px' }}></div>
          </div>
        </div>
      );

    // ── HR-F-11: EMPLOYEE GRIEVANCE FORM / REGISTER ──
    case 'HR-F-11':
      return (
        <div>
          <div className={styles.physicalGrid2Col}>
            <div className={styles.physicalCell}>
              <strong>Grievance No.:</strong> <span className={styles.physicalLine}></span>
            </div>
            <div className={styles.physicalCell}>
              <strong>Date Received:</strong> &nbsp;___ / ___ / _____
            </div>
            <div className={styles.physicalCell}>
              <strong>Employee Name:</strong> <span className={styles.physicalLine}></span>
            </div>
            <div className={styles.physicalCell}>
              <strong>Employee ID:</strong> <span className={styles.physicalLine}></span>
            </div>
            <div className={styles.physicalCell}>
              <strong>Department:</strong> <span className={styles.physicalLine}></span>
            </div>
            <div className={styles.physicalCell}>
              <strong>Received By:</strong> <span className={styles.physicalLine}></span>
            </div>
          </div>

          <div style={{ border: '1px solid #000', padding: '8px 12px', marginBottom: '12px', fontSize: '12px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>Nature of Grievance:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
              <span>☐ Salary/Payroll</span>
              <span>☐ Attendance</span>
              <span>☐ Leave</span>
              <span>☐ Supervisor/Manager</span>
              <span>☐ Workplace</span>
              <span>☐ Safety</span>
              <span>☐ Behaviour</span>
              <span>☐ Welfare</span>
              <span>☐ Other</span>
            </div>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>Details of Grievance:</div>
            <div style={{ borderBottom: '1px solid #000', minHeight: '24px', marginBottom: '6px' }}></div>
            <div style={{ borderBottom: '1px solid #000', minHeight: '24px' }}></div>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>Fact-finding / Action Taken:</div>
            <div style={{ borderBottom: '1px solid #000', minHeight: '24px', marginBottom: '6px' }}></div>
            <div style={{ borderBottom: '1px solid #000', minHeight: '24px' }}></div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
            <div>Acknowledged Date: _______________</div>
            <div>Target/Actual Closure Date: _______________</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div><strong>Status:</strong> &nbsp;☐ Open &nbsp;&nbsp; ☐ Closed</div>
            <div><strong>Outcome communicated to employee:</strong> &nbsp;☐ Yes &nbsp;&nbsp; ☐ No &nbsp;&nbsp; ☐ Not applicable</div>
          </div>
        </div>
      );

    // ── HR-F-12: EMPLOYEE ASSET ISSUE & HANDOVER FORM ──
    case 'HR-F-12':
      return (
        <div>
          <table className={styles.physicalTable}>
            <thead>
              <tr>
                <th>Asset / Item</th>
                <th>Asset ID / Serial No.</th>
                <th style={{ width: '60px' }}>Qty.</th>
                <th style={{ width: '80px' }}>Condition</th>
                <th style={{ width: '100px' }}>Issue Date</th>
                <th style={{ width: '100px' }}>Return Date</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(6)].map((_, i) => (
                <tr key={i} style={{ height: '26px' }}>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td>___/___/____</td>
                  <td>___/___/____</td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ border: '1px solid #000', padding: '8px 12px', fontSize: '12px', marginBottom: '16px' }}>
            <strong>Employee acknowledgement:</strong> I acknowledge receipt/return of the above company property and agree to follow applicable company controls.
            <div style={{ marginTop: '8px' }}>
              Employee Signature: _____________________ &nbsp;&nbsp;&nbsp;&nbsp; Date: ___ / ___ / _____
            </div>
          </div>
        </div>
      );

    // ── HR-F-13: EXIT CLEARANCE FORM ──
    case 'HR-F-13':
      return (
        <div>
          <table className={styles.physicalTable}>
            <thead>
              <tr>
                <th>Department / Area</th>
                <th>Responsible Person</th>
                <th style={{ width: '160px' }}>Clearance Status</th>
                <th style={{ width: '140px' }}>Signature / Date</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {['HR', 'Reporting Department', 'Stores', 'IT / Admin (where applicable)', 'Accounts', 'Other'].map((area, idx) => (
                <tr key={idx}>
                  <td><strong>{area}</strong></td>
                  <td>_____________________</td>
                  <td>☐ Cleared &nbsp; ☐ Pending</td>
                  <td>_________________</td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', margin: '12px 0' }}>
            <div>Employee Name: _____________________________</div>
            <div>Employee ID: _____________</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '12px' }}>
            <div>Last Working Date: ___________</div>
            <div>Reason: &nbsp;☐ Resignation &nbsp;&nbsp; ☐ Termination &nbsp;&nbsp; ☐ Retirement &nbsp;&nbsp; ☐ Other</div>
          </div>

          <div style={{ marginBottom: '16px', fontSize: '12px' }}>
            Pending items / remarks: _________________________________________________________________
          </div>
        </div>
      );

    // ── HR-F-14: EXIT INTERVIEW FORM ──
    case 'HR-F-14':
      return (
        <div>
          <div className={styles.physicalGrid2Col}>
            <div className={styles.physicalCell}>
              <strong>Employee Name:</strong> <span className={styles.physicalLine}></span>
            </div>
            <div className={styles.physicalCell}>
              <strong>Employee ID:</strong> <span className={styles.physicalLine}></span>
            </div>
            <div className={styles.physicalCell}>
              <strong>Department:</strong> <span className={styles.physicalLine}></span>
            </div>
            <div className={styles.physicalCell}>
              <strong>Designation:</strong> <span className={styles.physicalLine}></span>
            </div>
            <div className={styles.physicalCell}>
              <strong>Date of Joining:</strong> &nbsp;___ / ___ / _____
            </div>
            <div className={styles.physicalCell}>
              <strong>Last Working Date:</strong> &nbsp;___ / ___ / _____
            </div>
            <div className={styles.physicalCell}>
              <strong>Reporting Manager:</strong> <span className={styles.physicalLine}></span>
            </div>
            <div className={styles.physicalCell}>
              <strong>Interview Date:</strong> &nbsp;___ / ___ / _____
            </div>
          </div>

          <table className={styles.physicalTable}>
            <thead>
              <tr>
                <th>Topic</th>
                <th style={{ width: '180px' }}>Rating / Response</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              {[
                'Job satisfaction', 'Work environment', 'Supervisor / management',
                'Compensation / benefits', 'Growth / development', 'Training',
                'Reason for leaving', 'Would you recommend the company?'
              ].map((topic, i) => (
                <tr key={i} style={{ height: '26px' }}>
                  <td><strong>{topic}</strong></td>
                  <td></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>Suggestions for improvement:</div>
            <div style={{ borderBottom: '1px solid #000', minHeight: '24px' }}></div>
          </div>

          <div style={{ fontSize: '12px', marginBottom: '16px' }}>
            <strong>Would employee consider rejoining?</strong> &nbsp;☐ Yes &nbsp;&nbsp; ☐ No &nbsp;&nbsp; ☐ Maybe
          </div>
        </div>
      );

    // ── HR-F-15: FULL & FINAL CHECKLIST ──
    case 'HR-F-15':
      return (
        <div>
          <table className={styles.physicalTable}>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>Sl</th>
                <th>Check Item</th>
                <th style={{ width: '180px' }}>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {[
                'Resignation / separation documents', 'Notice period verified', 'Attendance verified',
                'Leave balance verified', 'Overtime verified', 'Assets returned', 'Advance / loan verified',
                'Department clearance', 'Salary / dues calculation', 'Statutory requirements checked',
                'Access deactivated', 'Exit interview completed', 'Management approval',
                'Relieving / service documents', 'Personnel file closed'
              ].map((chk, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{chk}</td>
                  <td>☐ Complete &nbsp; ☐ Pending</td>
                  <td>_____________________</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', margin: '12px 0' }}>
            <div>Employee: _____________________________</div>
            <div>Employee ID: _____________</div>
            <div>Last Working Date: _____________</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px' }}>
            <div>F&F Prepared By: _______________</div>
            <div>Verified By: _______________</div>
            <div>Approved By: _______________</div>
          </div>
        </div>
      );

    // ── HR-F-16: MONTHLY HR REPORT ──
    case 'HR-F-16':
      return (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '12px', fontWeight: 'bold' }}>
            <div>Reporting Month: _______________</div>
            <div>Prepared By: _______________</div>
            <div>Date: _______________</div>
          </div>

          <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>1. Total Manpower Breakdown</div>
          <table className={styles.physicalTable} style={{ marginBottom: '12px' }}>
            <thead>
              <tr>
                <th>HR Indicator</th>
                <th style={{ width: '70px' }}>Opening</th>
                <th style={{ width: '70px' }}>Additions</th>
                <th style={{ width: '70px' }}>Exits</th>
                <th style={{ width: '70px' }}>Closing</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {['Total Manpower', 'Production', 'QA/QC', 'Maintenance', 'Stores / Dispatch', 'Site / Civil', 'Office / Admin', 'Contract Manpower'].map((ind, i) => (
                <tr key={i} style={{ height: '24px' }}>
                  <td><strong>{ind}</strong></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>2. Monthly KPI Performance</div>
          <table className={styles.physicalTable} style={{ marginBottom: '12px' }}>
            <thead>
              <tr>
                <th>Monthly KPI</th>
                <th style={{ width: '130px' }}>Target</th>
                <th style={{ width: '90px' }}>Actual</th>
                <th style={{ width: '90px' }}>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {[
                { k: 'Manpower availability', t: '≥ 95%' },
                { k: 'Recruitment TAT', t: '≤ 15 working days' },
                { k: 'Attendance accuracy', t: '≥ 99%' },
                { k: 'Payroll input accuracy', t: '100%' },
                { k: 'Training completion', t: '≥ 95%' },
                { k: 'Employee documentation', t: '100%' },
                { k: 'Grievance acknowledgement', t: '≤ 2 working days' },
                { k: 'Grievance closure', t: '≤ 7 working days' },
                { k: 'Exit clearance', t: 'Approved F&F timeline' },
                { k: 'Applicable statutory compliance', t: '100% required actions' }
              ].map((item, i) => (
                <tr key={i} style={{ height: '24px' }}>
                  <td>{item.k}</td>
                  <td>{item.t}</td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>3. Monthly Activity Summary</div>
          <table className={styles.physicalTable} style={{ marginBottom: '12px' }}>
            <thead>
              <tr>
                <th>Monthly Activity</th>
                <th style={{ width: '140px' }}>Count / Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {[
                'New joiners', 'Resignations / exits', 'Open vacancies', 'Leave / absenteeism',
                'Overtime', 'Training completed', 'Grievances received / closed', 'Disciplinary cases', 'Other management actions'
              ].map((act, i) => (
                <tr key={i} style={{ height: '24px' }}>
                  <td>{act}</td>
                  <td></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>Management Remarks / Action Points:</div>
            <div style={{ borderBottom: '1px solid #000', minHeight: '24px' }}></div>
          </div>
        </div>
      );

    default:
      return (
        <div>
          <table className={styles.physicalTable}>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>Sl</th>
                <th>Procedure / Checklist Item</th>
                <th style={{ width: '120px' }}>Required</th>
                <th style={{ width: '140px' }}>Verified</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(6)].map((_, i) => (
                <tr key={i} style={{ height: '26px' }}>
                  <td>{i + 1}</td>
                  <td></td>
                  <td>Yes</td>
                  <td>☐ Verified</td>
                  <td>_____________________</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}
