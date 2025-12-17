using Microsoft.EntityFrameworkCore;
using glossaryApi.Models;

namespace glossaryApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Languages> Languages { get; set; }

        public DbSet<Terms> Terms { get; set; }

        public DbSet<Tags> Tags { get; set; }

        public DbSet<Translations> Translations { get; set; }
        
        public DbSet<Suggestions> Suggestions { get; set; }

        public DbSet<TagsContract> TagsContract { get; set; }

        public DbSet<NotificationSetting> NotificationSetting { get; set; }
        
        public DbSet<Synonyms> Synonyms { get; set; }

        public DbSet<Admin> Admin { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Languages>()
                .HasData(
                new Languages
                {
                    LanguageId = 1,
                    Name = LanguageConfiguration.BaseLanguageName,
                    Code = LanguageConfiguration.BaseLanguageCode
                }
            );

            modelBuilder.Entity<TagsContract>()
                .HasKey(tc => new { tc.TagId, tc.TermId });

            modelBuilder.Entity<TagsContract>()
                .HasOne(tc => tc.Tag)
                .WithMany(t => t.TagContract)
                .HasForeignKey(tc => tc.TagId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TagsContract>()
                .HasOne(tc => tc.Term)
                .WithMany(t => t.TagContract)
                .HasForeignKey(tc => tc.TermId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Tags>()
                .HasMany(t => t.TagContract)
                .WithOne(tc => tc.Tag)
                .HasForeignKey(tc => tc.TagId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Translations>()
                .HasOne(t => t.Term)
                .WithMany()
                .HasForeignKey(t => t.TermId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Translations>()
                .Property(t => t.Status)
                .HasConversion<string>();

            modelBuilder.Entity<Synonyms>()
                .HasOne(s => s.Term)
                .WithMany()
                .HasForeignKey(s => s.TermId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Synonyms>()
                .HasOne(s => s.SynonymTerm)
                .WithMany()
                .HasForeignKey(s => s.SynonymTermId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
