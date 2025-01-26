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
        /// <returns>A list of notifications.</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Notification>>> GetNotifications()
        {
            return await _context.Notifications.ToListAsync();
        }

        /// <summary>
        /// Gets a specific notification by ID.
        /// </summary>
        /// <param name="id">The ID of the notification.</param>
        /// <returns>The notification with the specified ID.</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<Notification>> GetNotification(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);

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
                return BadRequest();
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
    }
}