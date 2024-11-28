defmodule App.Repo.Migrations.CreateBots do
  use Ecto.Migration

  def change do
    create table(:bot, primary_key: false) do
      add :id, :uuid, primary_key: true, default: fragment("gen_random_uuid()")
      timestamps(type: :timestamptz)
    end
  end
end
