using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KaziChapChap.Core.Models; // Ensure this is the correct namespace for Notification
using KaziChapChap.Data;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace KaziChapChap.API.Controllers
{
    /// <summary>
    /// Handles CRUD operations for notifications.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationsController : ControllerBase
    {
        private readonly KaziDbContext _context;

        /// <summary>
        /// Initializes a new instance of the <see cref="NotificationsController"/> class.
        /// </summary>
        /// <param name="context">The database context.</param>
        public NotificationsController(KaziDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Gets all notifications.
        /// </summary>
        /// <returns>A list of notifications with user details.</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Notification>>> GetNotifications()
        {
            return await _context.Notifications
                .AsNoTracking()
                .Include(n => n.User)
                .ToListAsync();
        }

        /// <summary>
        /// Gets a specific notification by ID.
        /// </summary>
        /// <param name="id">The ID of the notification.</param>
        /// <returns>The notification with the specified ID.</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<Notification>> GetNotification(int id)
        {
            var notification = await _context.Notifications
                .AsNoTracking()
                .Include(n => n.User)
                .FirstOrDefaultAsync(n => n.NotificationID == id);

            if (notification == null)
            {
                return NotFound();
            }

            return notification;
        }

        /// <summary>
        /// Creates a new notification.
        /// </summary>
        /// <param name="notification">The notification to create.</param>
        /// <returns>The created notification.</returns>
        [HttpPost]
        public async Task<ActionResult<Notification>> PostNotification(Notification notification)
        {
            // Ensure the referenced User exists
            var userExists = await _context.Users.AnyAsync(u => u.UserID == notification.UserID);
            if (!userExists)
            {
                return BadRequest("Invalid UserID. User does not exist.");
            }

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetNotification), new { id = notification.NotificationID }, notification);
        }

        /// <summary>
        /// Updates an existing notification.
        /// </summary>
        /// <param name="id">The ID of the notification to update.</param>
        /// <param name="notification">The updated notification data.</param>
        /// <returns>No content if successful.</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> PutNotification(int id, Notification notification)
        {
            if (id != notification.NotificationID)
            {
                return BadRequest("Notification ID mismatch.");
            }

            // Ensure the referenced User exists
            var userExists = await _context.Users.AnyAsync(u => u.UserID == notification.UserID);
            if (!userExists)
            {
                return BadRequest("Invalid UserID. User does not exist.");
            }

            _context.Entry(notification).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Notifications.Any(n => n.NotificationID == id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        /// <summary>
        /// Deletes a notification.
        /// </summary>
        /// <param name="id">The ID of the notification to delete.</param>
        /// <returns>No content if successful.</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null)
            {
                return NotFound();
            }

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// Marks a notification as read.
        /// </summary>
        /// <param name="id">The ID of the notification.</param>
        /// <returns>No content if successful.</returns>
        [HttpPatch("{id}/mark-as-read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null)
            {
                return NotFound();
            }

            notification.IsRead = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
