using Microsoft.EntityFrameworkCore;
using Solario.Models;

namespace Solario.Data
{
    public class PostgresContext : DbContext
    {
        public PostgresContext(DbContextOptions<PostgresContext> options)
            : base(options)
        {
        }

        public DbSet<Question> Questions => Set<Question>();
        public DbSet<Answer> Answers => Set<Answer>();
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Question>()
            .HasMany(q => q.Answers)
            .WithOne()
            .HasForeignKey(a => a.QuestionId);
        }
    }


}

