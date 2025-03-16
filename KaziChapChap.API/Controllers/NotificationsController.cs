using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KaziChapChap.Core.Models;
using KaziChapChap.Data;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace KaziChapChap.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationsController : ControllerBase
    {
        private readonly KaziDbContext _context;

        public NotificationsController(KaziDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Gets notifications for the logged-in user only.
        /// </summary>
        [HttpGet("my")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Notification>>> GetMyNotifications()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized("User ID not found in token.");
            }

            var notifications = await _context.Notifications
                .Where(n => n.UserID == userId)
                .OrderByDescending(n => n.CreatedAt)
                .AsNoTracking()
                .ToListAsync();

            return notifications;
        }

        /// <summary>
        /// Marks a notification as read, if it belongs to the logged-in user.
        /// </summary>
        [HttpPatch("{id}/mark-as-read")]
        [Authorize]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null)
            {
                return NotFound();
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized("User ID not found in token.");
            }

            // Ensure the notification belongs to the logged-in user
            if (notification.UserID != userId)
            {
                return Forbid("You cannot mark another user's notification as read.");
            }

            notification.IsRead = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// (Optional) Create a new notification for the logged-in user
        /// without specifying UserID in the request body.
        /// </summary>
        [HttpPost("my")]
        [Authorize]
        public async Task<ActionResult<Notification>> PostMyNotification([FromBody] Notification notification)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized("User ID not found in token.");
            }

            notification.UserID = userId; // automatically set the user ID from the token
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetMyNotifications),
                new { /* no single ID route here, so optional */ },
                notification
            );
        }

        // Additional admin or debugging routes (e.g. GET all notifications, DELETE, etc.) can go here.
    }
}
