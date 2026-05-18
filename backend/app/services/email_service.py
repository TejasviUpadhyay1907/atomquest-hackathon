import resend
from app.core.config import settings
from typing import Optional


class EmailService:
    """Service for sending email notifications using Resend"""
    
    def __init__(self):
        if settings.RESEND_API_KEY:
            resend.api_key = settings.RESEND_API_KEY
            self.enabled = True
        else:
            self.enabled = False
    
    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str
    ) -> bool:
        """Send an email"""
        if not self.enabled:
            print(f"Email service disabled. Would send to {to_email}: {subject}")
            return False
        
        try:
            params = {
                "from": "AtomQuest <onboarding@resend.dev>",
                "to": [to_email],
                "subject": subject,
                "html": html_content
            }
            
            resend.Emails.send(params)
            return True
        
        except Exception as e:
            print(f"Error sending email: {e}")
            return False
    
    def send_goal_submitted_email(
        self,
        manager_email: str,
        manager_name: str,
        employee_name: str,
        goal_count: int
    ):
        """Send email to manager when employee submits goals"""
        subject = f"New Goal Submission from {employee_name}"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #1890ff;">New Goal Submission</h2>
                <p>Hi {manager_name},</p>
                <p><strong>{employee_name}</strong> has submitted <strong>{goal_count} goals</strong> for your review and approval.</p>
                <p>Please review the goals and either approve them or return them for rework.</p>
                <div style="margin: 30px 0;">
                    <a href="https://atomquest-frontend.vercel.app/manager/approvals" 
                       style="background-color: #1890ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                        Review Goals
                    </a>
                </div>
                <p style="color: #666; font-size: 14px;">
                    This is an automated notification from the Goal Tracking Portal.
                </p>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(manager_email, subject, html_content)
    
    def send_goal_approved_email(
        self,
        employee_email: str,
        employee_name: str,
        goal_count: int
    ):
        """Send email to employee when goals are approved"""
        subject = "Your Goals Have Been Approved"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #52c41a;">Goals Approved! ✓</h2>
                <p>Hi {employee_name},</p>
                <p>Great news! Your manager has approved your <strong>{goal_count} goals</strong>.</p>
                <p>Your goals are now locked and you can start working towards achieving them. Remember to complete your quarterly check-ins to track your progress.</p>
                <div style="margin: 30px 0;">
                    <a href="https://atomquest-frontend.vercel.app/employee/goals" 
                       style="background-color: #52c41a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                        View My Goals
                    </a>
                </div>
                <p style="color: #666; font-size: 14px;">
                    This is an automated notification from the Goal Tracking Portal.
                </p>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(employee_email, subject, html_content)
    
    def send_goal_rejected_email(
        self,
        employee_email: str,
        employee_name: str,
        goal_title: str,
        rejection_reason: str
    ):
        """Send email to employee when goal is rejected"""
        subject = "Goal Returned for Rework"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #faad14;">Goal Needs Revision</h2>
                <p>Hi {employee_name},</p>
                <p>Your manager has returned your goal <strong>"{goal_title}"</strong> for rework.</p>
                <div style="background-color: #fff7e6; border-left: 4px solid #faad14; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Feedback:</strong></p>
                    <p style="margin: 10px 0 0 0;">{rejection_reason}</p>
                </div>
                <p>Please review the feedback and update your goal accordingly.</p>
                <div style="margin: 30px 0;">
                    <a href="https://atomquest-frontend.vercel.app/employee/goals" 
                       style="background-color: #1890ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                        Update Goal
                    </a>
                </div>
                <p style="color: #666; font-size: 14px;">
                    This is an automated notification from the Goal Tracking Portal.
                </p>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(employee_email, subject, html_content)
    
    def send_check_in_reminder_email(
        self,
        employee_email: str,
        employee_name: str,
        quarter: str
    ):
        """Send reminder email for quarterly check-in"""
        subject = f"{quarter} Check-in Reminder"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #1890ff;">Quarterly Check-in Due</h2>
                <p>Hi {employee_name},</p>
                <p>This is a reminder to complete your <strong>{quarter} quarterly check-in</strong>.</p>
                <p>Please update your progress and achievement status for all your goals.</p>
                <div style="margin: 30px 0;">
                    <a href="https://atomquest-frontend.vercel.app/employee/check-ins" 
                       style="background-color: #1890ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                        Complete Check-in
                    </a>
                </div>
                <p style="color: #666; font-size: 14px;">
                    This is an automated notification from the Goal Tracking Portal.
                </p>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(employee_email, subject, html_content)
    
    def send_shared_goal_assigned_email(
        self,
        employee_email: str,
        employee_name: str,
        goal_title: str
    ):
        """Send email when shared goal is assigned"""
        subject = "New Shared Goal Assigned"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #1890ff;">Shared Goal Assigned</h2>
                <p>Hi {employee_name},</p>
                <p>A departmental goal <strong>"{goal_title}"</strong> has been assigned to you.</p>
                <p>You can adjust the weightage for this goal, but the title and target are set by your manager.</p>
                <div style="margin: 30px 0;">
                    <a href="https://atomquest-frontend.vercel.app/employee/goals" 
                       style="background-color: #1890ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                        View Goal
                    </a>
                </div>
                <p style="color: #666; font-size: 14px;">
                    This is an automated notification from the Goal Tracking Portal.
                </p>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(employee_email, subject, html_content)

