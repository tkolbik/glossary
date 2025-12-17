using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using glossaryApi.Dto;
using System.Linq;
using glossaryApi.Data;
using Microsoft.EntityFrameworkCore;

namespace glossaryApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : BaseController
    {
        private readonly IConfiguration _configuration;
        private readonly AppDbContext _context;

        public AuthController(IConfiguration configuration, AppDbContext context)
        {
            _configuration = configuration;
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request?.Password))
                {
                    return BadRequest("Password is required.");
                }

                var admin = await _context.Admin.FirstOrDefaultAsync();

                if (admin == null)
                {
                    return StatusCode(500, new ErrorResponse
                    {
                        Message = "Admin account not configured. Please run setup first.",
                        StatusCode = 500
                    });
                }

                if (!VerifyPassword(request.Password.Trim(), admin.PasswordHash))
                {
                    return Unauthorized("Invalid password.");
                }

                var token = GenerateJwtToken();

                var sameSiteMode = Request.IsHttps ? SameSiteMode.None : SameSiteMode.Lax;
                
                var cookieOptions = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = Request.IsHttps,
                    SameSite = sameSiteMode,
                    Expires = DateTimeOffset.UtcNow.AddDays(1),
                    Path = "/"
                };

                Console.WriteLine($"Setting cookie with Secure={Request.IsHttps}, SameSite={sameSiteMode}");
                Response.Cookies.Append("auth", token, cookieOptions);

                return Ok(new { message = "Login successful" });
            }
            catch (Exception ex)
            {
                return HandleError(ex, "logging in");
            }
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            try
            {
                var sameSiteMode = Request.IsHttps ? SameSiteMode.None : SameSiteMode.Lax;
                
                var cookieOptions = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = Request.IsHttps,
                    SameSite = sameSiteMode,
                    Expires = DateTimeOffset.UtcNow.AddDays(-1),
                    Path = "/"
                };

                Response.Cookies.Append("auth", "", cookieOptions);

                return Ok(new { message = "Logout successful" });
            }
            catch (Exception ex)
            {
                return HandleError(ex, "logging out");
            }
        }

        [HttpPost("setup")]
        public async Task<IActionResult> Setup([FromBody] SetupRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request?.Password))
                {
                    return BadRequest("Password is required.");
                }

                var trimmedPassword = request.Password.Trim();

                if (trimmedPassword.Length < 8)
                {
                    return BadRequest("Password must be at least 8 characters long.");
                }

                var existingAdmin = await _context.Admin.AnyAsync();
                if (existingAdmin)
                {
                    return BadRequest("Admin account already exists. Use the change password endpoint instead.");
                }

                var admin = new glossaryApi.Models.Admin
                {
                    PasswordHash = HashPassword(trimmedPassword),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Admin.Add(admin);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Admin account created successfully. You can now log in." });
            }
            catch (Exception ex)
            {
                return HandleError(ex, "setting up admin account");
            }
        }

        [HttpPost("change-password")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request?.OldPassword) || string.IsNullOrEmpty(request?.NewPassword))
                {
                    return BadRequest("Old password and new password are required.");
                }

                var trimmedNewPassword = request.NewPassword.Trim();

                if (trimmedNewPassword.Length < 8)
                {
                    return BadRequest("New password must be at least 8 characters long.");
                }

                var admin = await _context.Admin.FirstOrDefaultAsync();
                if (admin == null)
                {
                    return NotFound("Admin account not found.");
                }

                if (!VerifyPassword(request.OldPassword.Trim(), admin.PasswordHash))
                {
                    return Unauthorized("Invalid old password.");
                }

                admin.PasswordHash = HashPassword(trimmedNewPassword);
                admin.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Password changed successfully." });
            }
            catch (Exception ex)
            {
                return HandleError(ex, "changing password");
            }
        }

        [HttpGet("setup-required")]
        public async Task<IActionResult> SetupRequired()
        {
            try
            {
                var adminExists = await _context.Admin.AnyAsync();
                return Ok(new { setupRequired = !adminExists });
            }
            catch (Exception ex)
            {
                return HandleError(ex, "checking setup status");
            }
        }

        [HttpGet("verify")]
        [Authorize(Roles = "Admin")]
        public IActionResult Verify()
        {
            var cookieValue = Request.Cookies["auth"];
            Console.WriteLine($"Verify endpoint - Cookie present: {cookieValue != null}, Value length: {cookieValue?.Length ?? 0}");
            return Ok(new { message = "Authenticated" });
        }


        private string GenerateJwtToken()
        {
            var jwtKey = Environment.GetEnvironmentVariable("JwtKey") ?? _configuration["JwtKey"];
            var jwtIssuer = Environment.GetEnvironmentVariable("JwtIssuer") ?? _configuration["JwtIssuer"];
            var jwtAudience = Environment.GetEnvironmentVariable("JwtAudience") ?? _configuration["JwtAudience"];

            if (string.IsNullOrEmpty(jwtKey) || string.IsNullOrEmpty(jwtIssuer) || string.IsNullOrEmpty(jwtAudience))
            {
                throw new InvalidOperationException("JWT configuration is missing");
            }

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, "Admin"),
                new Claim(ClaimTypes.Role, "Admin"),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        private bool VerifyPassword(string password, string hashedPassword)
        {
            try
            {
                return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
            }
            catch
            {
                return false;
            }
        }
    }

    public class LoginRequest
    {
        public string Password { get; set; } = string.Empty;
    }

    public class SetupRequest
    {
        public string Password { get; set; } = string.Empty;
    }

    public class ChangePasswordRequest
    {
        public string OldPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}

