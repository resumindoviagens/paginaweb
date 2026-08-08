alter table clients add column if not exists email text;
comment on column clients.email is 'Email de contato do cliente cadastrado no painel interno.';
