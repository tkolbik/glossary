using Microsoft.EntityFrameworkCore;
using glossaryApi.Data;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using glossaryApi.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpClient();
builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Version = "v1",
        Title = "Glossary API",
        Description = "API for managing glossary terms, translations, and suggestions",
        Contact = new OpenApiContact
        {
            Name = "Glossary app",
        }
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
});

var jwtKey = Environment.GetEnvironmentVariable("JwtKey") ?? builder.Configuration["JwtKey"];
var jwtIssuer = Environment.GetEnvironmentVariable("JwtIssuer") ?? builder.Configuration["JwtIssuer"];
var jwtAudience = Environment.GetEnvironmentVariable("JwtAudience") ?? builder.Configuration["JwtAudience"];

if (string.IsNullOrEmpty(jwtKey) || string.IsNullOrEmpty(jwtIssuer) || string.IsNullOrEmpty(jwtAudience))
{
    throw new InvalidOperationException("JWT configuration is missing. Please check environment variables or appsettings.json");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var cookieValue = context.Request.Cookies["auth"];
                context.Token = cookieValue;
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

var mysqlHost = Environment.GetEnvironmentVariable("MYSQLHOST");
var mysqlDb = Environment.GetEnvironmentVariable("MYSQL_DATABASE");
var mysqlUser = Environment.GetEnvironmentVariable("MYSQLUSER");
var mysqlPass = Environment.GetEnvironmentVariable("MYSQLPASSWORD");

var connStr = $"Server={mysqlHost};Database={mysqlDb};User={mysqlUser};Password={mysqlPass};Port=3306;SslMode=Preferred;";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connStr, ServerVersion.AutoDetect(connStr))
);

builder.Services.AddScoped<LanguageService>();
builder.Services.AddSingleton<RateLimitingService>();
builder.Services.AddHostedService<RateLimitingCleanupService>();
builder.Services.AddScoped<NotificationSettingsService>();
builder.Services.AddScoped<EmailNotificationService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy.WithOrigins("http://localhost:3000", "http://localhost:3001")
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials());
});


Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);
var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Glossary API v1");
    options.RoutePrefix = "swagger";
    options.DocumentTitle = "Glossary API Documentation";
});
app.UseHsts();
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";

        var exceptionHandlerPathFeature = context.Features.Get<IExceptionHandlerPathFeature>();
        var error = exceptionHandlerPathFeature?.Error;

        await context.Response.WriteAsJsonAsync(new
        {
            message = "An unexpected error occurred.",
            detail = error?.Message
        });
    });
});

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseRouting();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
