using Microsoft.AspNetCore.Mvc;
using glossaryApi.Dto;
using System;

namespace glossaryApi.Controllers
{
    public abstract class BaseController : ControllerBase
    {
        protected IActionResult HandleError(Exception ex, string operation, int statusCode = 500)
        {   
            return StatusCode(statusCode, new ErrorResponse
            {
                Message = $"An error occurred while {operation}",
                Detail = ex.Message,
                StatusCode = statusCode
            });
        }

        protected IActionResult BadRequest(string message, string? detail = null)
        {
            return base.BadRequest(new ErrorResponse
            {
                Message = message,
                Detail = detail,
                StatusCode = 400
            });
        }

        protected IActionResult NotFound(string message)
        {
            return base.NotFound(new ErrorResponse
            {
                Message = message,
                StatusCode = 404
            });
        }

        protected IActionResult Conflict(string message)
        {
            return base.Conflict(new ErrorResponse
            {
                Message = message,
                StatusCode = 409
            });
        }

        protected IActionResult Unauthorized(string message)
        {
            return base.Unauthorized(new ErrorResponse
            {
                Message = message,
                StatusCode = 401
            });
        }
    }
}


