build/bin build/obj/release/src:
	@mkdir -p $@

src/main.c.o: %.o: %
	@gcc -c $< -o build/obj/release/$@

release: include src/main.c.o build/bin build/obj/release/src
	@gcc src/main.c.o -o build/bin/wilu

clean-release: 
	@rm -rf build

build/bin build/bin/headers build/bin/headers/more:
	@mkdir -p $@

grr.h headers/faa.h headers/more/daf.h headers/more/ffd.h headers/rew.h tee.h:
	@cd src; cp --parents -t ../build/bin $@

include: grr.h headers/faa.h headers/more/daf.h headers/more/ffd.h headers/rew.h tee.h build/bin build/bin/headers build/bin/headers/more

clean-include: 
	@rm -rf build